import { ProgressModelQuery } from '../../models/index.js';
import { getSettings } from '../settingsAPI.js';
import debug from 'debug';

const debugGN = debug('api:exercise:getNext');

export async function isNewAllowed(userId) {
    const {
        GET_NEXT_MAX_INITIAL_IDIOMS, GET_NEXT_MAX_NEW_IDIOMS
    } = getSettings();

    const query = await ProgressModelQuery.create(userId);
    const dates = query.idiomaticCreationDates();
    const now   = Date.now();

    const ONE_DAY_MS = 24 * 60 * 60 * 1000;

    // 1. Let the user build MAX_INITIAL amount
    //    no matter how long it takes.
    if (dates.length < GET_NEXT_MAX_INITIAL_IDIOMS) {
        return true;
    }

    // 2. If the user has used the app for more than 24 hours
    //    but have not wracked up (MAX_INITIAL * 2) then let them
    //    keep building their calendar
    const hasOldProgress = dates.some(d => (now - d) > ONE_DAY_MS);
    if (hasOldProgress && dates.length < (GET_NEXT_MAX_INITIAL_IDIOMS * 2)) {
        return true;
    }

    // 3. After that only allow GET_NEXT_MAX_NEW_IDIOMS for the last 24 hours
    const recentCount = dates.filter(e => (now - e) < ONE_DAY_MS).length;
    debugGN('Checking recent: %d against %d', recentCount, GET_NEXT_MAX_NEW_IDIOMS)
    return recentCount < GET_NEXT_MAX_NEW_IDIOMS;
}
