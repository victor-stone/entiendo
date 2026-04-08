import db from './db.js';

/*
  The Sandbox db is a history log of users practicing 
  missed words exercises (aka "shovels")

 {
    "shovelId": "027d4aaa-02a9-4159-9768-a6c7b1b5e9e2",
    "date": 1761767342124,
    "evaluation": {
      "transcriptionFeedback": "Minor error with 'todos' being transcribed as 'todo'.",
      "translationFeedback": "Translation is accurate.",
      "englishTranslation": "Everyone arrived before the hour.",
      "targetWords": [
        "todos",
        "llegaron",
        "antes",
        "hora"
      ],
      "missedWords": [
        "todos"
      ]
    },
    "userId": "google-oauth2|101722812212104773442",
    "sandboxId": "af705b5e-dd43-4e2f-8b6b-feb1c2afcfc3"
  }
    
*/
export default class Sandbox extends db {
  constructor() {
    super('sandbox','sandboxId');
  }

  history(userId) {
    return this._(
              this.data.filter( s => s.userId == userId )
            ).sort( (a,b) => b.date - a.date);
  }
}

db.initCache('sandbox')
