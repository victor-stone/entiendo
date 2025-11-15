import { consultAssistant } from '../lib/openai.js';
import { Prompts, Reports, Progress,
    Users, Examples, Idioms, History
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
    const _history    = new History();
    const to          = Date.now();
    const from        = to - ONE_WEEK;
    let   history     = _history.history(userId, from);
    let   progressIds = history.map( h => h.progressId );
          progressIds = new Set(progressIds);
    const _progress   = new Progress();
    let   progress    = _progress.filter( p => progressIds.has(p.progressId) );

          progress  = JSON.stringify(progress, null, 2);
          history   = JSON.stringify(history, null, 2);

    const _prompts    = new Prompts();
    const userMessage = _prompts.getPromptByName('WEEKLY_REPORT_USER', { userId, progress, history })
    const report      = await consultAssistant(OPENAI_ASSISTANT_ID, userMessage)
    const _reports    = new Reports();
    const record      = _reports.addReport(report, from, to);

    const users = new Users();
    users.update( userId, { report: {
        reportId: record.reportId,
        generated: to,
        seen: 0
    }});    
    return record;
}

export async function getReport(routeContext) {
    const { user, params: { reportId } } = routeContext;

    const _reports = new Reports();
    const report   = _reports.byId(reportId);
    const examples = new Examples();
    const idioms   = new Idioms();
    const progress = new Progress();
    
    _resolveUUIDs(report, examples, idioms, progress);

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

function _resolveUUIDs(report, examples, idioms, progress) {
    report.insights.forEach( (insight,i) => {
        const uuids = insight.description.match(uuidRegex)
        uuids?.forEach( uuid => {
            let alt = examples.byId(uuid);
            if( !alt ) {
                alt = progress.byId(uuid);
            }
            const idiom   = alt ? idioms.byId(alt.idiomId) : idioms.byId(uuid);

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
    let   reports  = _reports.matching('userId', userId);
    const state    = getReportState(user);

    if( generate || !reports || !reports.length ) {
        if( (state == ReportStates.RS_GEN_NEW_AVAIL) || (state == ReportStates.RS_NOREP_NEW_AVAIL)) {
            const report = await _generateReport(userId);
            reports = [ report, ...(reports || []) ];
        }
    }

    const examples = new Examples();
    const idioms = new Idioms();
    const progress = new Progress();

    reports = reports.map(r => _resolveUUIDs(r, examples, idioms, progress));

    reports.sort( (a,b) => b.generated - a.generated );

    return {
        reports,
        state
    };
}

export function getReportState(user) {
    const weekAgo  = Date.now() - ONE_WEEK;
    const _history = new History();

    if( user.report ) {
        if( user.report.generated < weekAgo) {
            const history = _history.history(user.userId, user.report.generated);
            if(history.length > REPORTING_MIN_PROGRESS) {
                return ReportStates.RS_GEN_NEW_AVAIL;
            }
        }
        return ReportStates.RS_GEN_NO_AVAIL;
    }

    const history = _history.history(user.userId).sort( (a,b) => a.date - b.date );

    if( history.length > REPORTING_MIN_PROGRESS && history[0].date < weekAgo ) {
        return ReportStates.RS_NOREP_NEW_AVAIL;
    }

    return ReportStates.RS_NOREP_NO_AVAIL;
}