import debug from 'debug';
import { ExampleModel, IdiomModel, ExampleModelQuery, IdiomModelQuery,  ProgressModelQuery } from '../../models/index.js';
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
    const [idiom, progress] = await _getNextDueIdiom(routeContext);

    if (idiom) {
        return await _getExerciseForDueIdiom({ idiom, progress, routeContext });
    }

    return null;
}

async function _getExerciseForDueIdiom({ idiom, progress, routeContext }) {
    const { 
        GET_NEXT_EXAMPLES_PER_IDIOM, 
        GET_NEXT_ATTEMPTS_PER_EXAMPLE } = getSettings();

    const exQuery = await ExampleModelQuery.create();

    const seenExampleIds      = progress.history.map( ({exampleId}) => exampleId);
    const seenExampleIdCounts = seenExampleIds.reduce( (obj, id) => {
        if( !obj[id] ) obj[id] = 0;
        obj[id]++;
        return obj;
    }, {});

    // If user hasn't seen enough examples, try to find or create a new one
    if (seenExampleIds.length < GET_NEXT_EXAMPLES_PER_IDIOM) {
        const examplesForIdiom = exQuery.forIdiom(idiom.idiomId);
        let exercise = examplesForIdiom.find(({ exampleId }) => !seenExampleIds.includes(exampleId));
        if (!!exercise) {
            debugGetNext('Found an example the user has not seen %s', exercise.exampleId);
            return await finalizeExample(exercise, {idiom, debug: debugGetNext});
        }
        debugGetNext('User has seen all existing samples, making new %o', seenExampleIdCounts);
        exercise = await createExample(idiom, null, examplesForIdiom);
        return await finalizeExample(exercise, {idiom, debug: debugGetNext});
    }

    // User has seen all examples, pick one they've seen the least (or random)
    let exampleToUse = seenExampleIds
            .sort( (a,b) => seenExampleIdCounts[a] - seenExampleIdCounts[b])
            .find(id => seenExampleIdCounts[id] < GET_NEXT_ATTEMPTS_PER_EXAMPLE);

    if (exampleToUse) {
        debugGetNext('User has seen this example before %o', seenExampleIdCounts);
    } else {
        exampleToUse = seenExampleIds[Math.floor(Math.random() * seenExampleIds.length)];
        debugGetNext('WARNING: User has seen all the examples max times, picking one random %o', seenExampleIdCounts);
    }
    debugGetNext('Using: %s', exampleToUse )
    
    const exercise = exQuery.example(exampleToUse);
    return await finalizeExample(exercise, {idiom, debug: debugGetNext});
}

async function _isNewAllowed(routeContext) {
    /*
        if total number of progress < GET_NEXT_MAX_INITIAL_IDIOMS then return true.

        If the user has any progress record older than 24 hours and the total number of 
        progress is < (GET_NEXT_MAX_INITIAL_IDIOMS * 2) then return true;

        After that only allow GET_NEXT_MAX_NEW_IDIOMS for the last 24 hours.

        You can calcuate the date of usage by looking at exercise.history[n].date
    */
    const { user: { userId } } = routeContext;
    return isNewAllowed(userId);
}

async function _getExerciseForNewIdiom(routeContext) {

    const isNewAllowed = await _isNewAllowed(routeContext);
    if (!isNewAllowed) {
        return null;
    }

    const model = new ExampleModel();
    let  idiom = await _getNewIdiom(routeContext);
    if( !idiom ) {
        debugGetNext('New idioms are allowed but the user has seen all of this tone/usage');
        const fallback = { ...routeContext, query: { ...routeContext.query, tone: null, usage: null } };
        idiom = await _getNewIdiom(fallback);
    }
    debugGetNext('Nothing is due for user, fetched: %s', idiom.text);

    const exercises = await model.findByIdiomId(idiom.idiomId);
    let exercise;
    if (exercises && exercises.length > 0) {
        debugGetNext('found an existing exercise');
        exercise = exercises[0];
    } else {
        exercise = await createExample(idiom, model);
        debugGetNext('created a new exercise');
    }
    return await finalizeExample(exercise, {idiom, model, debug: debugGetNext});
}

async function _getNextDueIdiom(routeContext) {
    const { query: { tone, usage }, user: { userId } } = routeContext;
    debugGetNext('Finding due idiom (tone: %s, usage: %s )', 
        tone || '-', usage || '-');

    const progQuery   = await ProgressModelQuery.create(userId);
    const dueItem = progQuery.nextDue(tone,usage);

    let idiom = null;
    if (dueItem ) {
        const idQuery = await IdiomModelQuery.create();
        idiom = idQuery.idiom(dueItem.idiomId);
    }
    return [idiom, dueItem]
}

async function _getNewIdiom(routeContext) {
    const { query: { tone, usage }, user: { userId } } = routeContext;

    const progQuery    = await ProgressModelQuery.create(userId);
    const idQuery      = await IdiomModelQuery.create();
    const idioms       = await idQuery.byCriteria(tone,usage);
    const seenIdiomIds = new Set(progQuery.idiomIds());
    const idiom        = idioms.find(({idiomId}) => !seenIdiomIds.has(idiomId));

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
        const model          = new ExampleModel();
        const idioms         = new IdiomModel();
        let exercise         = await model.getById(preferences.getNextExample);
        let idiom            = await idioms.getById(exercise.idiomId);
        return await finalizeExample(exercise, {idiom, model, debug: debugGetNext});
    } : null;
}

