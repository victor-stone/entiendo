import { ProgressModelQuery } from '../../models/index.js';
import { getSettings } from '../settingsAPI.js';
import debug from 'debug';

const debugGN = debug('api:exercise:getNext');

export async function isNewAllowed(userId) {
    const {
        GET_NEXT_MAX_INITIAL_IDIOMS, // Allow new as long as you're under this number
        GET_NEXT_MAX_NEW_IDIOMS      // after that only allow this many per 24 hours
    } = getSettings();

    const query = await ProgressModelQuery.create(userId);
    const dates = query.idiomaticCreationDates();

    //  Let the user build MAX_INITIAL amount
    //  no matter how long it takes.
    if (dates.length < GET_NEXT_MAX_INITIAL_IDIOMS) {
        return true;
    }

    const now   = Date.now();

    const ONE_DAY_MS = 24 * 60 * 60 * 1000;

    // After that only allow GET_NEXT_MAX_NEW_IDIOMS for the last 24 hours
    const recentCount = dates.filter(e => (now - e) < ONE_DAY_MS).length;
    debugGN('Checking recent: %d against %d', recentCount, GET_NEXT_MAX_NEW_IDIOMS)
    return recentCount < GET_NEXT_MAX_NEW_IDIOMS;
}
