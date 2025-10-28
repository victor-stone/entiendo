import debug from 'debug';
import { Examples, Progress, Idioms, History } from '../../models/index.js';
import { NotFoundError, CalendarExhaustedError } from '../../../shared/constants/errorTypes.js';
import { getSettings } from '../settingsAPI.js';
import { isNewAllowed } from './isNewAllowed.js';
import { finalizeExample } from '../lib/finalizeExample.js';
import { createExample } from '../lib/createExample.js';

const debugGetNext = debug('api:exercise:getNext');

export async function getNext(routeContext) {
    debugGetNext('**** Getting next exercise for user %s *****', routeContext.user.name || routeContext.user.userId);

    const bypassExercise = _getAdminBypassExercise(routeContext);
    if (bypassExercise) 
        return await bypassExercise();

    let exercise = await _getNextDueExercise(routeContext);
    if( exercise ) {
        return exercise;
    }

    exercise = await _getExerciseForNewIdiom(routeContext);
    if( exercise ) {
        exercise.isNew = true;
        return exercise;
    }

    const { query: { tone, usage } } = routeContext;
    if( tone || usage ) {
        const fallback = { ...routeContext, query: { ...routeContext.query, tone: null, usage: null } };
        const fallbackExercise = await _getNextDueExercise(fallback);
        if( fallbackExercise ) {
            return fallbackExercise;
        }
    }

    debugGetNext('No due idiom found and new idioms are forbidden');
    throw new CalendarExhaustedError('No due idioms available');
}

async function _getNextDueExercise(routeContext) {
    const [idiom, progressRecDue] = _getNextDueIdiom(routeContext);

    if (idiom) {
        return await _getExerciseForDueIdiom({ idiom, progressRecDue });
    }

    return null;
}

async function _getExerciseForDueIdiom({ idiom, progressRecDue }) {
    const { GET_NEXT_EXAMPLES_PER_IDIOM } = getSettings();

    const gatherCounts = (counts, id) => {
        counts[id] = (counts[id] || 0) + 1;
        return counts;
    };

    const _history   = new History();
    const history    = _history.forProgress(progressRecDue.progressId);
    const allSeen    = history.map( ({exampleId}) => exampleId);
    const seenCounts = allSeen.reduce(gatherCounts, {});
    const seen       = Object.keys(seenCounts);
    let   exercise   = null;

    const _examples        = new Examples();
    const examplesForIdiom = _examples.forIdiom(idiom.idiomId);

    // If user hasn't seen all or enough examples, try to find or create a new one
    if (seen.length <  examplesForIdiom.length || seen.length < GET_NEXT_EXAMPLES_PER_IDIOM) {
        exercise = examplesForIdiom.byId(({ exampleId }) => !seen.includes(exampleId));
        if (!!exercise) {
            debugGetNext('Found an example the user has not seen %s', exercise.exampleId);
        } else {
            debugGetNext('User has seen all existing samples, making new %o', seenCounts);
            exercise = await createExample(idiom, null, examplesForIdiom);
        }
    } else {
        // User has seen all examples, cycle them by id (why not?) from now on

        const controlIndex = seen.sort().indexOf(allSeen[ allSeen.length - 1 ]);
        if( controlIndex !== 1 ) {
            console.log( 'Control index: ' + controlIndex )
        }
        const exampleToUse = seen[ (controlIndex + 1) % seen.length ];
        exercise = _examples.byId(exampleToUse);
        if( typeof exercise.audio === 'object' ) 
            throw "WRONG EXERCISE SHAPE"
        debugGetNext('Using: %s', exampleToUse )
    }

    return await finalizeExample(exercise, {idiom, debug: debugGetNext});
}

async function _isNewAllowed(routeContext) {
    /*
        if total number of progress < GET_NEXT_MAX_INITIAL_IDIOMS then return true.

        If the user has any progress record older than 24 hours and the total number of 
        progress is < (GET_NEXT_MAX_INITIAL_IDIOMS * 2) then return true;

        After that only allow GET_NEXT_MAX_NEW_IDIOMS for the last 24 hours.

        You can calcuate the date of usage by looking at history[n].date
    */
    const { user: { userId } } = routeContext;
    return isNewAllowed(userId);
}

async function _getExerciseForNewIdiom(routeContext) {

    const isNewAllowed = await _isNewAllowed(routeContext);
    if (!isNewAllowed) {
        return null;
    }

    let  idiom = await _getNewIdiom(routeContext);
    if( !idiom ) {
        debugGetNext('New idioms are allowed but the user has seen all of this tone/usage');
        const fallback = { ...routeContext, query: { ...routeContext.query, tone: null, usage: null } };
        idiom = await _getNewIdiom(fallback);
    }
    debugGetNext('Nothing is due for user, fetched: %s', idiom.text);

    const query = new Examples();
    
    const exercises = query.forIdiom(idiom.idiomId);
    let exercise;
    if (exercises && exercises.length > 0) {
        debugGetNext('found an existing exercise');
        exercise = exercises[0];
    } else {
        exercise = await createExample(idiom);
        debugGetNext('created a new exercise');
    }
    return await finalizeExample(exercise, {idiom, debug: debugGetNext});
}

function _getNextDueIdiom(routeContext) {
    const { query: { tone, usage }, user: { userId } } = routeContext;
    
    debugGetNext('Finding due idiom (tone: %s, usage: %s )', tone || '-', usage || '-');

    const _progress = new Progress();
    const dueItem   = _progress.nextDue(userId, tone, usage);

    let idiom = null;
    if (dueItem ) {
        const _idioms = new Idioms();
              idiom   = _idioms.byId(dueItem.idiomId);
    }
    return [idiom, dueItem]
}

async function _getNewIdiom(routeContext) {
    const { query: { tone, usage }, user: { userId } } = routeContext;

    const _progress    = new Progress();
    const _idioms      = new Idioms();
    const idioms       = _idioms.byCriteria(tone,usage);
    const seenIdiomIds = _progress.idiomIds(userId);
    const idiom        = idioms.find(({idiomId}) => !seenIdiomIds.includes(idiomId));

    if (idiom) {
        // debugGetNext("Found match: %s - %s: %s", tone, usage, idiom.text);
    } else {
        if( tone || usage ) {
            return null;
        }
        // TODO: make some more idioms with this spec
        debugGetNext("OOPS User has seen all idioms that match: %s - %s", tone, usage)
        throw new NotFoundError(`Wups, turns out there's nothing here... Refresh your browser(!)`);
    }
    
    return idiom;
}

function _getAdminBypassExercise(routeContext) {
    const { user: { preferences } } = routeContext;
    return preferences.getNextExample ? async () => {
        debugGetNext("Getting admin example: " + preferences.getNextExample)
        const _examples = new Examples();
        const _idioms   = new Idioms();
        let   exercise  = await _examples.byId(preferences.getNextExample);
        let   idiom     = await _idioms.byId(exercise.idiomId);
        return await finalizeExample(exercise, { idiom, model: _examples, debug: debugGetNext });
    } : null;
}

