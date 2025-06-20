import { ExampleModel } from '../src/server/models/index.js';
import dump from './dump.js';

async function dumpExamples() {
    const model = new ExampleModel();
    await dump(model, 'example');
}

dumpExamples();
