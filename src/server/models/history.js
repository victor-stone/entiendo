import db from './db.js';

export default class History extends db {
  constructor() {
    super('history','historyId');
  }

  forProgress(progressId) {
    return this.filter(h => h.progressId == progressId);
  }

  history(userId, from = 0, to = Date.now()) {
    return this.filter( h => {
      if( h.userId != userId ) return false;
      if( h.date < from ) return false;
      if( h.date > to ) return false;
      return true;
    });
  }

  lastSeen(userId, exampleId) {
    const sorted = this
                    .filter(h => h.userId == userId && h.exampleId == exampleId)
                    .sort( (a,b) => b.date - a.date );
    return sorted[0]?.date;
  }

  missedWords(userId, unique, withCounts = false) {
    
    const words = this.data.reduce((arr, h) => {
      if (h.userId == userId && !!h.evaluation?.missedWords?.length) {
        arr.push( ...h.evaluation.missedWords );
      }
      return arr;
    }, [])

    const flat = words
                  .flat() // <-- I don't think this is needed
                  .filter( w => !w.match(/[¡¿?!]/) )
                  .map( w => w.toLowerCase() );

    if( !withCounts ) {
      return unique
        ? [... new Set(flat)].sort()
        : flat;
    }

    const counts = {};
    for (const word of flat) {
      counts[word] = (counts[word] || 0) + 1;
    }

    return Object.entries(counts)
      .map(([word, count]) => ({ word, count }))
      .sort((a, b) => a.word.localeCompare(b.word));

  }
}

db.initCache('history');
