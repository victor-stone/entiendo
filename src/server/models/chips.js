import db from './db.js';

/*
  A history log of users attempts at Flash cards
  (see flash)

  {
    "createdAt":1773948139777,
    "date": 1773948139333,
    "falshId": "f0ee434e-1d95-4fbf-ba9e-375eb9a4f538",
    "score": 8,
    "scores": [],
    "userId": "google-oauth2|101722812212104773442",
    "chipsId": "2835849c-590e-40e7-88d0-28a261649b29"
  },
*/
export default class Chips extends db {
  constructor() {
    super('chips', 'chipId', true);
  }

  forUser(userId) {
    return this.filter( c => c.userId == userId);
  }

  oldest(userId) {
    const recs = this.forUser(userId).sort( (a,b) => b.date - a.date );
    return recs.length ? recs[0] : null;
  }

  worstScore(userId) {
    const recs = this.forUser(userId).sort( (a,b) => a.score - b.score );
    return recs.length ? recs[0] : null;
  }
}

db.initCache('chips')
