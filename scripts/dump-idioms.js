import IdiomModel from '../src/server/models/IdiomModel.js'
import dump from './dump.js';

async function dumpIdioms() {
    const model = new IdiomModel();
    await dump(model, 'idioms');
}

dumpIdioms();

