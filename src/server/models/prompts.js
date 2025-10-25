import db from './db.js';

export default class Prompts extends db {
  constructor() {
    super('prompts','promptId');
  }

  getPromptByName(keyValue, substitutions = {}) {
    const r = this.find(keyValue);
    return r.prompt.replace(/\$\{(\w+)\}/g, (_, k) => k in substitutions ? substitutions[k] : '${'+k+'}');
  }

}

db.initCache('prompts')
