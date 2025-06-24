import { UserModel, ProgressModel } from '../src/server/models/index.js';
import { progressQuery } from './query.js';

const vsId = "google-oauth2|101722812212104773442";


async function main() {
    const progress = new ProgressModel();

    const notVS = progressQuery.q('..{.userId !== $vsId}', { vsId });

    for( const prog of notVS ) {
        console.log('Deleting: ', prog.progressId);
        await progress.delete(prog.progressId);
    }
}

try {
    await main();
} catch(err) {
    console.log(err);
}
console.log('done');