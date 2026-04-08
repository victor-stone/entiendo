import db from './db.js';

/*
  A "shovel" is a an example using a missed phrase, any user can use it

  {
    "createdAt": 1749313709208,
    "text": "Todavía tengo que terminar el trabajo.",
    "source": "openai",
    "basedOn": [
      "todavía"
    ],
    "shovelId": "b720879c-a8b1-4397-983f-8c6626545c9c",
    "audio": "https://entiendo-audio-files-426593798727.s3.amazonaws.com/tts/todav_a_tengo_que_terminar_el_9912.mp3",
    "voice": "Agustin"
  }  
*/
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

