import db from './db.js';
import usageRangeOptions from '../../shared/constants/usageRanges.js'

const dateASC = (a, b) => a.dueDate - b.dueDate;

export default class Progress extends db {
  constructor() {
    super('progress', 'progressId', true);
  }

  due(userId) {
    const now = Date.now();
    return this.filter(p => p.userId == userId && p.dueDate < now);
  }

  forIdiom(userId, idiomId) {
    return this.find( p => p.userId == userId && p.idiomId == idiomId );
  }

  idiomIds(userId) {
    const filtered = this.data.filter( p => {
      if( !p.idiomId ) return false;
      if( p.userId != userId ) return false;
      return true;
    })
    return [... new Set(filtered.map(p => p.idiomId))]
  }

  creationDates(userId) {
    return this.data.filter(p => p.userId == userId).map(p => p.createdAt);
  }

  nextDue(userId, tone, usage) {
    const now = Date.now();
    const { lo, hi } = usage
      ? usageRangeOptions.find(({ value }) => value === usage)
      : { lo: 0, hi: 0 };

    const recs = this.data.filter(p => {
      if (p.userId !== userId) return false;
      if (tone && p.tone != tone) return false;
      if (usage && (p.usage < lo || p.usage > hi)) return false;
      if (p.dueDate > now) return false;

      return true;

    }).sort(dateASC);

    return this._(recs[0]);
  }

  schedule(userId) {
    return this.filter(p => p.userId == userId).sort(dateASC)
  }

}

db.initCache('progress')
