import progress from '../staging/query/progress.js';
import idioms from '../staging/query/idioms.js';
import examples from '../staging/query/examples.js';
import { format } from 'timeago.js'

function noteProgress() {
  const userId = "google-oauth2|101722812212104773442";

  let history = progress.progress.reduce( (history, p) => {
    if( !p.isSandbox && p.userId === userId ) {
      const idiom = idioms.idioms.find( i => i.idiomId == p.idiomId );
      history.push(
        ...p.history.map( h => {
          const example = examples.example.find( e => e.exampleId == h.exampleId);
          return {
            idiom: idiom.text,
            date: h.date,
            fdate: format(h.date),
            example: example.text
          }
        })
      );
    }
    return history;
  }, [] )

  history.sort( (a,b) => b.date - a.date );

  for( var i = 0; i < 150; i++ ) {
    const h = history[i];
    console.log( `${h.fdate}\t"${h.idiom}"\t${h.example}`)
  }
}

function progressForIdiom(text) {
  const idiom = idioms.idioms.find( i => i.text == text );
  const prog = progress.progress.find( p => p.idiomId == idiom.idiomId );
  const history = prog.history.map( h => {
    const example = examples.example.find( e => e.exampleId == h.exampleId );
    return {
      date: h.date,
      fdate: format(h.date),
      example: example.text
    }
  });

  history.forEach( h => console.log( `${h.fdate}\t${h.example}`));
}
// noteProgress();
progressForIdiom('te toca');
