import { ProgressModel } from '../src/server/models/index.js';
import dump from './dump.js';

async function dumpProgress() {
    const model = new ProgressModel();
    await dump(model, 'progress');
}

dumpProgress();
