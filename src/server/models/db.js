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

  commit() {
    try {
      const data = this.data;
      const path = this._path;
      writeJson( path, data ).then( () => {
        debugDB(`wrote ${data.length} records to ${path}`)
      })
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
    return _(this.data.filter(cb));
  }

  find(keyValue) {
    return this.findByValue(this._key, keyValue);
  }

  findAll(key, value) {
    return _(this.data.filter(record => record[key] === value));
  }

  findByValue(key, value) {
    return _(this.data.find(record => record[key] === value));
  }

  genIdKey() {
    return { [this._key]: uuidv4() }
  }

  key(record) {
    return record[this._key];
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

db.initCache = (name) => {
  const path = _path(name);
  readJson(path).then( data => {
    _cache[path] = data;
    console.log( `retrieved ${data.length} records from ${name} bucket`)
  })
}