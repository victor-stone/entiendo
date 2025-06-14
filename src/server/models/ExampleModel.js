// src/server/models/ExampleModel.js
import BaseModel from "./BaseModel.js";

// TODO make this events
const onUpdate = [];
function notifyUpdates(key, value) {
  onUpdate.forEach((u) => u(key, value));
}

/**
 * Model for storing and retrieving example sentences for idioms
 * 
 * {
 *  "basedOn"          : ['foo', 'bar'] // MIGHT BE NULL
    "exampleId"        : "97353048-3d1d-49f0-92ce-ac99ce8967b0",
    "createdAt"        : 1747079328336,
    "conjugatedSnippet": "armó un quilombo",  // MIGHT BE NULL
    "idiomId"          : "ebfef004-a6d8-45ad-bc63-f6f6a48ca3e7", // MIGHT BE NULL
    "source"           : "openai",
    "text"             : "Mi primo armó un quilombo bárbaro en la fiesta anoche.",
    "audio" : {
      publicUrl: 'http://....',
      url: 'http://....',
      expires: 1747078883354
    }
 */
export default class ExampleModel extends BaseModel {
  constructor() {
    super("IdiomExamples", "exampleId");
  }

  async create(obj) {
    const createdAt = Date.now();
    const spec = { createdAt, ...obj };
    const record = super.create(spec);
    notifyUpdates();
    return record;
  }

  async update(key, updates) {
    const record = super.update(key, updates);
    notifyUpdates(key, updates);
    return record;
  }

  async findByIdiomId(idiomId) {
    const filterExpression = {
      expression: "idiomId = :idiomId",
      values: {
        ":idiomId": { S: idiomId },
      },
    };

    return this.findAll(filterExpression);
  }

  async createExample(
    idiomId,
    text,
    conjugatedSnippet,
    source = "openai",
    audio = null
  ) {
    return this.create({
      idiomId,
      text,
      conjugatedSnippet,
      source,
      audio,
    });
  }

  async createSandboxExample(text, basedOn, source = "openai", audio = null) {
    return this.create({
      idiomId: null,
      basedOn,
      text,
      source,
      audio,
    });
  }

  async addAudio(exampleId, audio) {
    return this.update(exampleId, { audio });
  }
}

ExampleModel.onUpdate = (callback) => onUpdate.push(callback);
