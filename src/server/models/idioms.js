import db from './db.js';
import usageRangeOptions from '../../shared/constants/usageRanges.js'

export default class Idioms extends db {
  constructor() {
    super('idioms', 'idiomId', true);
  }


  byCriteria(tone, usage, field) {
    if (!tone && !usage) {
      if (field) {
        return this.data.map(i => i[field]);
      }
      return this.all();
    }

    const { lo, hi } = usage
      ? usageRangeOptions.find(({ value }) => value === usage)
      : { lo: 0, hi: 0 };

    const filtered = this.data.filter(t => {
      if (tone && t.tone !== tone) return false;
      if (usage && (t.usage < lo || t.usage > hi)) return false;
      return true;
    })

    if (field) {
      return filtered.map(i => i[field]);
    }

    return this._(filtered);
  }

  directory() {
    return this.data.map(({ idiomId, text }) => { return { idiomId, text } })
  }

  tones() {
    return [... new Set(this.data.map(i => i.tone))]
  }

}

// DEBUG
const audioFlattener = r => {
  if( r.homework ) {
    delete r.homework;
  }
  if( r.assigned ) {
    delete r.assigned;
  }
  return r;
};

db.initCache('idioms', audioFlattener)
