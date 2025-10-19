import { consultAssistant } from '../lib/openai.js';
import { PromptModel, ProgressModelQuery, ReportModel, UserModel,
    ExampleModelQuery, IdiomModelQuery
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
    const query    = await ProgressModelQuery.create(userId);
    const to       = Date.now();
    const from     = to - ONE_WEEK;
    const history  = query.history(from);
    const progress = JSON.stringify(history, null, 2);

    const model       = new PromptModel();
    const userMessage = await model.getPromptByName('WEEKLY_REPORT_USER', { userId, progress })
    const report      = await consultAssistant(OPENAI_ASSISTANT_ID, userMessage)
    const reportModel = new ReportModel();
    const record      = await reportModel.addReport(report, from, to);

    const userModel   = new UserModel();
    await userModel.update( userId, { report: {
        reportId: record.reportId,
        generated: to,
        seen: 0
    }});    
    return record;
}

export async function getReport(routeContext) {
    const { user, params: { reportId } } = routeContext;
    const model = new ReportModel();
    const report = await model.getById(reportId);
    const examples = await ExampleModelQuery.create();
    const idioms = await IdiomModelQuery.create();
    _resolveUUIDs(report, examples, idioms);
    if( user.report.reportId == reportId ) {
        const userModel = new UserModel();
        await userModel.update( user.userId, {
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
            const example =  examples.example(uuid);
            const idiom = example ?idioms.idiom(example.idiomId) : idioms.idiom(uuid);
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

    const model   = new ReportModel();
    let   reports = await model.findByUser(userId);
    const state   = await getReportState(user);

    if( generate || !reports || !reports.length ) {
        if( (state == ReportStates.RS_GEN_NEW_AVAIL) || (state == ReportStates.RS_NOREP_NEW_AVAIL)) {
            const report = await _generateReport(userId);
            reports = [ report, ...(reports || []) ];
        }
    }

    const examples = await ExampleModelQuery.create();
    const idioms = await IdiomModelQuery.create();

    reports = reports.map(r => _resolveUUIDs(r,examples,idioms));

    reports.sort( (a,b) => b.generated - a.generated );

    return {
        reports,
        state
    };
}

const _countHistory   = (history) => history.reduce( (acc, prog) => acc + prog.history.length, 0 );
const _flattenHistory = (history) => history.map( ({history}) => history ).flat();

export async function getReportState(user) {
    const weekAgo  = Date.now() - ONE_WEEK;
    const query    = await ProgressModelQuery.create(user.userId);
    if( user.report ) {
        if( user.report.generated < weekAgo) {
            const history = query.history(user.report.generated);
            if(_countHistory(history) > REPORTING_MIN_PROGRESS) {
                return ReportStates.RS_GEN_NEW_AVAIL;
            }
        }
        return ReportStates.RS_GEN_NO_AVAIL;
    }
    const progress = query.schedule();
    const history = _flattenHistory(progress);
    if( history.length > REPORTING_MIN_PROGRESS && history[0].date < weekAgo ) {
        return ReportStates.RS_NOREP_NEW_AVAIL;
    }
    return ReportStates.RS_NOREP_NO_AVAIL;
}