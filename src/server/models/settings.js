import db from './db.js';

export default class Settings extends db {
  constructor() {
    super('settings', 'settingsId');
  }

  all() {
    const all = super.all();
    return all.reduce((obj, { settingsId, value }) => {
      obj[settingsId] = value;
      return obj;
    }, {});
  }

  _putOrCreate(obj, create) {
    for (const [key, value] of Object.entries(obj)) {
      create
        ? this.create({ settingsId: key, value })
        : this.update(key, { value })
    };
    return Object.keys(obj);
  }

  put(objectOrKey, value) {
    if (typeof value !== 'undefined') objectOrKey = { [objectOrKey]: value };
    return this._putOrCreate(objectOrKey, false);
  }
  add(objectOrKey, value) {
    if (typeof value !== 'undefined') objectOrKey = { [objectOrKey]: value };
    return this._putOrCreate(objectOrKey, true);
  }  
}

db.initCache('settings')
