import db from './db.js';

export default class Reports extends db {
  constructor() {
    super('reports','reportId');
  }

 addReport(report, from, to) {
    const rec = {
      ...report,
      generated: Date.now(),
      from,
      to,
      lastSeen: 0,
    };
    return this.create(rec);
  }  
}

db.initCache('reports')

