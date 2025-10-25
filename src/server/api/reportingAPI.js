import { consultAssistant } from '../lib/openai.js';
import { Progress, Prompts, Reports, 
    Users, Examples, Idioms
 } from '../models/index.js';

import * as ReportStates from '../../shared/constants/reportStates.js';

const OPENAI_ASSISTANT_ID = process.env.OPENAI_ASSISTANT_ID;
const ONE_WEEK = 7 * 24 * 60 * 60 * 1000;

const REPORTING_MIN_PROGRESS = 10;

export async function generateReport(routeContext) {
    const { user: { userId } } = routeContext;
    return _generateReport(userId);
}

async function _generateReport(userId) {
    const query    = new Progress();
    const to       = Date.now();
    const from     = to - ONE_WEEK;
    const history  = query.history(userId, from);
    const progress = JSON.stringify(history, null, 2);

    const _prompts    = new Prompts();
    const userMessage = _prompts.getPromptByName('WEEKLY_REPORT_USER', { userId, progress })
    const report      = await consultAssistant(OPENAI_ASSISTANT_ID, userMessage)
    const _reports    = new Reports();
    const record      = _reports.addReport(report, from, to);

    const users   = new Users();
    users.update( userId, { report: {
        reportId: record.reportId,
        generated: to,
        seen: 0
    }});    
    return record;
}

export async function getReport(routeContext) {
    const { user, params: { reportId } } = routeContext;

    const _reports    = new Reports();
    const report   = _reports.find(reportId);

    const examples = new Examples();
    const idioms   = new Idioms();
    
    _resolveUUIDs(report, examples, idioms);

    if( user.report.reportId == reportId ) {
        const users = new Users();
        users.update( user.userId, {
            report: {
                ...user.report,
                seen: Date.now()
            }
        });
    }
    return report;
}

const uuidRegex = /\b[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}\b/g;

function _resolveUUIDs(report, examples, idioms) {
    report.insights.forEach( (insight,i) => {
        const uuids = insight.description.match(uuidRegex)
        uuids?.forEach( uuid => {
            const example =  examples.find(uuid);
            const idiom = example ? idioms.find(example.idiomId) : idioms.find(uuid);
            report.insights[i].description = report.insights[i].description.replace( uuid, idiom.text );
        })
    });
    return report;
}

export async function getAllReports(routeContext) {
    const { 
        user, 
        user: { userId }, 
        query: { 
            generate
        } 
    } = routeContext;

    const _reports = new Reports();
    let   reports  = _reports.findAll('userId', userId);
    const state    = await getReportState(user);

    if( generate || !reports || !reports.length ) {
        if( (state == ReportStates.RS_GEN_NEW_AVAIL) || (state == ReportStates.RS_NOREP_NEW_AVAIL)) {
            const report = await _generateReport(userId);
            reports = [ report, ...(reports || []) ];
        }
    }

    const examples = new Examples();
    const idioms = new Idioms();

    reports = reports.map(r => _resolveUUIDs(r, examples, idioms));

    reports.sort( (a,b) => b.generated - a.generated );

    return {
        reports,
        state
    };
}

const _countHistory   = (history) => history.reduce( (acc, prog) => acc + prog.history.length, 0 );
const _flattenHistory = (history) => history.map( ({history}) => history ).flat();

export function getReportState(user) {
    const weekAgo  = Date.now() - ONE_WEEK;
    const query    = new Progress();
    if( user.report ) {
        if( user.report.generated < weekAgo) {
            const history = query.history(user.userId, user.report.generated);
            if(_countHistory(history) > REPORTING_MIN_PROGRESS) {
                return ReportStates.RS_GEN_NEW_AVAIL;
            }
        }
        return ReportStates.RS_GEN_NO_AVAIL;
    }
    const progress = query.schedule(user.userId);
    const history = _flattenHistory(progress);
    if( history.length > REPORTING_MIN_PROGRESS && history[0].date < weekAgo ) {
        return ReportStates.RS_NOREP_NEW_AVAIL;
    }
    return ReportStates.RS_NOREP_NO_AVAIL;
}