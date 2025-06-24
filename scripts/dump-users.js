import UserModel from '../src/server/models/UserModel.js'
import dump from './dump.js';

async function dumpUsers() {
    const model = new UserModel();
    await dump(model, 'users');
}

dumpUsers();

