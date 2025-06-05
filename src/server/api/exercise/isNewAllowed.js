import { ProgressModelQuery } from '../../models/index.js';
import { getSettings } from '../settingsAPI.js';

export async function isNewAllowed(userId) {
    const {
        MAX_INITIAL_NEW_IDIOMS, MAX_NEW_IDIOMS
    } = await getSettings();

    const query = await ProgressModelQuery.create(userId);
    const dates = query.idiomaticCreationDates();
    const now   = Date.now();

    const ONE_DAY_MS = 24 * 60 * 60 * 1000;

    // 1. If total number of progress < MAX_INITIAL_NEW_IDIOMS then return true.
    if (dates.length < MAX_INITIAL_NEW_IDIOMS) {
        return true;
    }

    // 2. If any progress is older than 24 hours and total < (MAX_INITIAL_NEW_IDIOMS * 2) then return true
    const hasOldProgress = dates.some(d => (now - d) > ONE_DAY_MS);
    if (hasOldProgress && dates.length < (MAX_INITIAL_NEW_IDIOMS * 2)) {
        return true;
    }

    // 3. After that only allow MAX_NEW_IDIOMS for the last 24 hours
    const recentCount = dates.filter(e => (now - e) < ONE_DAY_MS).length;
    return recentCount < MAX_NEW_IDIOMS;
}
