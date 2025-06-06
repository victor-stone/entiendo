// src/server/models/IdiomModel.js
import BaseModel from './BaseModel.js';

/*
{
 "idiomId"    : "b157b729-01b1-452c-9301-fe7ee92d3b6a",
 "family"     : "dar",
 "region"     : "RP",
 "text"       : "dar la lata",
 "tone"       : "Casual",
 "translation": "to bother be a nuisance",
 "usage"      : 7
}
*/
/**
 * Model for Idiom-related database operations
 */
export default class IdiomModel extends BaseModel {
  constructor() {
    // Pass the table name to the parent constructor
    super('Idioms');
  }

  async create(item) {
    var usage = Number(item.usage);
    // TODO: call OpenAI if tone and usage are not filled 
    const record = super.create({...item, usage, createdAt: Date.now()});
    notifyUpdates();
    return record;
  }

  async update(id, updates) {
    if (updates.hasOwnProperty('usage')) {
      updates.usage = Number(updates.usage);
    }
    const record = super.update(id,updates);
    notifyUpdates();
    return record;
  }
}

// TODO make this events
const onUpdate = [];
function notifyUpdates() {
  onUpdate.forEach(u => u());
}
IdiomModel.onUpdate = (callback) => onUpdate.push(callback);
