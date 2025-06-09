import BaseModel from './BaseModel.js';

export default class SettingsModel extends BaseModel {
  constructor() {
    super('Settings', 'settingsId');
  }

  async _putOrCreate( obj, create ) {
    const promises = [];
    for (const [key, value] of Object.entries(obj)) {
        promises.push( create 
            ? this.create( { settingsId: key, value  })
            : this.update(key, {value}) );
    }
    await Promise.all(promises);
    return await SettingsModel.flush();

  }

  put(objectOrKey, value) {
    if( value ) objectOrKey = { [objectOrKey]: value }
    return this._putOrCreate(objectOrKey, false);
  }

  add(objectOrKey, value) {
    if( value ) objectOrKey = { [objectOrKey]: value }
    return this._putOrCreate( objectOrKey, true );
  }
}

let _cache = null;
SettingsModel.get = (key) => _cache[key];
SettingsModel.all = () => ({ ..._cache });
const _singleton = new SettingsModel();
SettingsModel.flush = async () => {
    const records = await _singleton.findAll();
    _cache = records.reduce( (obj, {settingsId, value}) => {
        obj[settingsId] = value;
        return obj;
    }, {});
    return _cache
}

(async () => {
    await SettingsModel.flush();
})();