import db from './db.js';
import usageRangeOptions from '../../shared/constants/usageRanges.js'

const dateASC = (a, b) => a.dueDate - b.dueDate;

export default class Progress extends db {
  constructor() {
    super('progress', 'progressId', true);
  }

  due(userId) {
    const now = Date.now();
    return this._(this.data.filter(p => p.userId == userId && p.dueDate < now));
  }

  exampleIds(userId) {
    const exampleIds = this.data.reduce((arr, p) => {
      if (p.userId == userId) {
        arr.push(p.history.map(h => h.exampleId))
      }
      return arr;
    }, [])
    return [...new Set(exampleIds.flat())];
  }

  forIdiom(userId, idiomId) {
    return this._(this.data.find( p => p.userId == userId && p.idiomId == idiomId ))
  }

  history(userId, from, to = Date.now()) {
    return this.data.reduce((arr, p) => {
      if (p.userId === userId ) {
        const copy = this._(p);
        copy.history = p.history.filter(({ date }) => date >= from && date <= to);
        arr.push(copy);
      }
      return arr;
    }, [])
  }

  idiomIds(userId) {
    const filtered = this.data.filter( p => {
      if( !p.idiomId ) return false;
      if( p.userId != userId ) return false;
      return true;
    })
    return [... new Set(filtered.map(p => p.idiomId))]
  }

  idiomaticCreationDates(userId) {
    return this.data.filter(p => p.userId == userId && !!p.idiomId).map(p => p.createdAt);
  }

  missedWords(userId, unique) {
    const words = this.data.reduce((arr, p) => {
      if (p.userId == userId) {
        arr.push(...p.history.filter(h => !!h.evaluation?.missedWords?.length).map(h => h.evaluation?.missedWords))
      }
      return arr;
    }, [])

    const flat = words
                  .flat()
                  .filter( w => !w.match(/[¡¿?!]/) )
                  .map( w => w.toLowerCase() );

    return unique
      ? [... new Set(flat)].sort()
      : flat;
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

    return recs[0];
  }

  schedule(userId) {
    return this._(this.data.filter(p => p.userId == userId)).sort(dateASC)
  }

}

db.initCache('progress')
