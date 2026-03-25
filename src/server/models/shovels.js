import db from './db.js';

export default class Shovels extends db {
  constructor() {
    super('shovels','shovelId', true);
  }

  addAudio(shovelId, spec) {
    return this.update(shovelId, spec);
  }

  forWord(word) {
    return this._(this.data.filter( s => s.basedOn.includes(word) ))
  }
  
  basedOn(userId, unique = true) {
    
    const words = this.data.reduce((arr, h) => { arr.push( ...h.basedOn ); return arr; }, []);

    const flat = words
                  .flat() // <-- I don't think this is needed
                  .filter( w => !w.match(/[¡¿?!]/) )
                  .map( w => w.toLowerCase() );

    return unique
      ? [... new Set(flat)].sort()
      : flat;
  }
}

db.initCache('shovels')

