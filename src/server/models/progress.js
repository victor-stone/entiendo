import db from './db.js';
import usageRangeOptions from '../../shared/constants/usageRanges.js'


/*
  Created once per idiom per user - keep cumulative progress
  for that user for that particular idiom (see: history)

 {
    "idiomId": "cdb3f030-aec3-45f1-8f38-76020244ceb8",
    "userId": "google-oauth2|101722812212104773442",
    "tone": "Casual",
    "usage": 8,
    "progressId": "823c05d8-8359-49a5-9155-236af779ea65",
    "createdAt": 1775233510981,
    "interval": 3,
    "difficulty": 2.5,
    "dueDate": 1775752297339,
    "successRate": 0.8556666666666667,
    "lapseCount": 0,
    "isLeech": false,
    "successStreak": 2
  }

*/
const dateASC = (a, b) => a.dueDate - b.dueDate;

export default class Progress extends db {
  constructor() {
    super('progress', 'progressId', true);
  }

  due(userId, { includePaused = true } = {}) {
    const now = Date.now();
    return this.filter(p => {
      if (p.userId != userId)         return false;
      if (!includePaused && p.paused) return false;
      if (!(p.dueDate < now))         return false;
      return true;
    });
  }

  forIdiom(userId, idiomId) {
    return this.find( p => p.userId == userId && p.idiomId == idiomId );
  }

  idiomIds(userId, { includePaused = true } = {}) {
    const filtered = this.data.filter( p => {
      if( !p.idiomId ) return false;
      if( p.userId != userId ) return false;
      if( !includePaused && p.paused ) return false;
      return true;
    })
    return [... new Set(filtered.map(p => p.idiomId))]
  }

  creationDates(userId, { includePaused = true } = {}) {
    return this.data
      .filter(p => p.userId == userId && (includePaused || !p.paused))
      .map(p => p.createdAt);
  }

  nextDue(userId, tone, usage, { includePaused = true } = {}) {
    const now = Date.now();
    const { lo, hi } = usage
      ? usageRangeOptions.find(({ value }) => value === usage)
      : { lo: 0, hi: 0 };

    const recs = this.data.filter(p => {
      if (p.userId !== userId) return false;
      if (!includePaused && p.paused) return false;
      if (tone && p.tone != tone) return false;
      if (usage && (p.usage < lo || p.usage > hi)) return false;
      if (p.dueDate > now) return false;

      return true;

    }).sort(dateASC);

    return this._(recs[0]);
  }

  upcoming(userId) {
    const now = Date.now();
    const recs = this.data.filter( p => {
      if( p.userId !== userId ) return false;
      if( p.dueDate < now ) return false;
      return true;
    }).sort(dateASC);

    return this._(recs[0]);
  }

  schedule(userId) {
    const all = this.filter(p => p.userId == userId);
    const active = all.filter(p => !p.paused).sort(dateASC);
    const paused = all.filter(p => p.paused).sort(dateASC);
    return active.concat(paused);
  }

}

db.initCache('progress')
