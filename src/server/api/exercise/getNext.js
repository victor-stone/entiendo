import debug from 'debug';
import { ExampleModel, IdiomModel, ProgressModel, ProgressModelQuery } from '../../models/index.js';
import { NotFoundError, CalendarExhaustedError } from '../../../shared/constants/errorTypes.js';
import { getSettings } from '../settingsAPI.js';
import { isNewAllowed } from './isNewAllowed.js';
import { finalizeExample } from '../lib/finalizeExample.js';
import { createExample } from '../lib/createExample.js';

const debugGetNext = debug('api:exercise:getNext');

const PAST_DUE = true;

export async function getNext(routeContext) {
    debugGetNext('**** Getting next exercise for user %s *****', routeContext.user.userId);

    const bypassExercise = _getAdminBypassExercise(routeContext);
    if (bypassExercise) 
        return await bypassExercise();

    let exercise = await _getNextDueExercise(routeContext);
    if( exercise ) {
        return exercise;
    }

    exercise = await _getExerciseForNewIdiom(routeContext);
    if( exercise ) {
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
        EXAMPLE_PER_IDIOM_THRESHOLD, 
        ATTEMPTS_PER_EXAMPLE_THRESHOLD } = await getSettings();

    const model               = new ExampleModel();
    const seenExampleIdCounts = {};
    const seenExampleIds      = [];

    progress.history.forEach(({ exampleId }) => {
        seenExampleIds.push(exampleId);
        seenExampleIdCounts[exampleId] = (seenExampleIdCounts[exampleId] || 0) + 1;
    });

    // If user hasn't seen enough examples, try to find or create a new one
    if (seenExampleIds.length < EXAMPLE_PER_IDIOM_THRESHOLD) {
        const examplesForIdiom = await model.findByIdiomId(idiom.idiomId);
        let exercise = examplesForIdiom.find(({ exampleId }) => !seenExampleIds.includes(exampleId));
        if (!!exercise) {
            debugGetNext('Found an example the user has not seen');
            return await finalizeExample(exercise, idiom, model, debugGetNext);
        }
        debugGetNext('User has seen all existing samples, making a new one');
        exercise = await createExample(idiom, model, examplesForIdiom);
        return await finalizeExample(exercise, idiom, model, debugGetNext);
    }

    // User has seen all examples, pick one they've seen the least (or random)
    let exampleToUse = seenExampleIds
        .slice() // copy
        .reverse()
        .find(id => seenExampleIdCounts[id] < ATTEMPTS_PER_EXAMPLE_THRESHOLD);

    if (exampleToUse) {
        debugGetNext('User has seen this example before but within threshold');
    } else {
        exampleToUse = seenExampleIds[Math.floor(Math.random() * seenExampleIds.length)];
        debugGetNext('WARNING: User has seen all the examples max times, picking one random');
    }
    const exercise = await model.getById(exampleToUse);
    return await finalizeExample(exercise, idiom, model, debugGetNext);
}

async function _isNewAllowed(routeContext) {
    /*
        if total number of progress < MAX_INITIAL_NEW_IDIOMS then return true.

        If the user has any progress record older than 24 hours and the total number of 
        progress is < (MAX_INITIAL_NEW_IDIOMS * 2) then return true;

        After that only allow MAX_NEW_IDIOMS for the last 24 hours.

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
    return await finalizeExample(exercise, idiom, model, debugGetNext);
}

async function _getNextDueIdiom(routeContext) {
    const { query: { tone, usage }, user: { userId } } = routeContext;
    debugGetNext('Finding due idiom (tone: %s, usage: %s )', 
        tone || '-', usage || '-');

    const idiomModel    = new IdiomModel();
    const progressModel = new ProgressModel();
    const dueItems      = await progressModel.findDueItems(userId, {tone, usage}, PAST_DUE);
    let dueItem, idiom;
    if (dueItems && dueItems.length) {
        dueItem = dueItems[0];
        idiom = await idiomModel.getById(dueItem.idiomId);
    }
    return [idiom, dueItem]
}

async function _getNewIdiom(routeContext) {
    const { query: { tone, usage }, user: { userId } } = routeContext;

    const idiomModel = new IdiomModel();
    const query = await ProgressModelQuery.create(userId);

    const idiomIds = await idiomModel.findIdsByCriteria({tone,usage})
    
    // Find first idiom not in user history
    const seenIdiomIds = query.idiomIds();
    const idiomId = idiomIds.find(id => !seenIdiomIds.has(id));

    if (idiomId) {
        // debugGetNext("Found match: %s - %s: %s", tone, usage, idiom.text);
    } else {
        if( tone || usage ) {
            return null;
        }
        // TODO: make some more idioms with this spec
        debugGetNext("OOPS User has seen all idioms that match: %s - %s", tone, usage)
        throw new NotFoundError(`Wups, turns out there's nothing here... Refresh your browser(!)`);
    }

    const idiom = idiomModel.getById(idiomId);
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
        return await finalizeExample(exercise, idiom, model, debugGetNext);
    } : null;
}

