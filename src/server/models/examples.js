import db from './db.js';

/*
    Examples of idioms 

  {
    "conjugatedSnippet": "nos miramos entre sí",
    "audio": "https://entiendo-audio-files-426593798727.s3.amazonaws.com/tts/cuando_dijeron_que_se_hab_a_ca.mp3",
    "createdAt": 1755533006335,
    "idiomId": "dbfaa758-929e-4c9b-93ed-d9e58d52e2a3",
    "text": "Cuando dijeron que se había cancelado el partido, nos miramos entre sí sin poder creerlo.",
    "source": "openai",
    "exampleId": "6f70699a-d562-465b-b4ec-7e86a4585f8a",
    "voice": "Malena"
  }
        
*/
export default class Examples extends db {
  constructor() {
    super('examples', 'exampleId', true);
  }

  addAudio(exampleId, spec) {
    return this.update(exampleId, spec);
  }

  forIdiom(idiomId) {
    return this.matching('idiomId', idiomId);
  }

}

db.initCache('examples')
