import { v4 as uuidv4 } from 'uuid';
import { readJson, writeJson } from '../lib/aws/s3dataBucket.js';
import debug from 'debug';

const debugDB = debug('api:db');

const DATA_DIR = 'entiendo/data/';

const _ = o => o === undefined ? undefined : JSON.parse(JSON.stringify(o));
const _path = (name) => DATA_DIR + name + '.json';

const _cache = new Map();

export default class db {
  constructor(name, key, doTS) {
    this._doTime = doTS;
    this._key    = key;
    this._path   = _path(name)
  }

  get data() {
    return _cache[this._path]; 
  }

  set data(data) {
    _cache[this._path] = data;
  }

  _(o) {
    return _(o);
  }

  all() {
    return _(this.data);
  }

  byId(keyValue) {
    return this.matchingOne(this._key, keyValue);
  }

  commit() {
    try {
      const data = this.data;
      const path = this._path;
      if( db.preventWrite ) {
        debugDB(`blocking write of ${data.length} records to ${path}`);
      } else {
        writeJson( path, data ).then( () => 
          debugDB(`wrote ${data.length} records to ${path}`)
        );
      }
    } catch( err ) {
      console.error(err);
    }
  }

  create(record) {
    if (!record[this._key]) {
      record[this._key] = uuidv4();
    }
    if (this._doTime) {
      record.createdAt = Date.now();
    }
    this.data.push(record);
    this.commit();
    return _(record);
  }

  filter(cb) {
    return _(this.data).filter(cb);
  }

  find(cb) {
    return _(this.data).find(cb);
  }
  
  forEach(cb) {
    return _(this.data).forEach(cb);
  }

  genIdKey() {
    return { [this._key]: uuidv4() }
  }

  key(record) {
    return record[this._key];
  }

  matching(key, value) {
    return this.filter(record => record[key] === value);
  }
  
  matchingOne(key, value) {
    return this.find(record => record[key] === value);
  }

  reduce(cb) {
    return _(this.data).reduce(cb, [])
  }

  remove(keyValue) {
    const data = this.data;
    delete data[keyValue];
    this.data = data;
    this.commit();
  }
  
  update(keyValue, newValues) {
    const record = this.#_update(keyValue, newValues);
    this.commit();
    return _(record);
  }

  #_update(keyValue, newValues) {
    const index = this.data.findIndex(record => record[this._key] == keyValue);
    this.data[index] = { ...this.data[index], ...newValues };
    return this.data[index];
  }

  updateObject(obj) {
    for (const [key, value] of Object.entries(obj)) {
      this.#_update(key, value);
    }
    this.commit();
  }

}

db.preventWrite = false;

db.initCache = ( name, mapper ) => {
  const path = _path(name);
  return readJson(path).then( data => {
    if( mapper ) {
      _cache[path] = data.map(mapper);
      console.log('applied mapper to ' + name )
    } else {
      _cache[path] = data;
    }
    console.log( `retrieved ${data.length} records from ${name} bucket`)
  })
}

db.resetCache = async () => {
  const paths = [..._cache];
  for( var i = 0; i < paths.length; i++ ) {
    const name = paths[i][0];
    await db.initCache(name);
  }
}

export async function resetCache() {
  await db.resetCache();  
}
