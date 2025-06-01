import { ProgressModel, ExampleModel } from "../../models/index.js";


export async function clearMissedWord(userId, word) {
    const model = new ProgressModel();
    const progress = await model.findByUser(userId);

    for( const i = 0; i < progress.length; i++ ) {
        const p = progress[i];
        for( const ih = 0; ih < p.history.length; ih++ ) {
            const h = p.history[ih];
            for( const iv = 0; iv < h.length; iv++ ) {
                const words = h.evaluation.missedWords.split(',');
                if( words.include(word) ) {
                    h.evaluation.missedWords = words.filter( w => w != word ).join(', ');
                    model.update(p.progressId, p);
                    return p;
                }
            }
        }
    }
}

export async function missedWords(routeContext) {
    const { user: { userId } } = routeContext;

    const model = new ProgressModel();
    const progress = await model.findByUser(userId);

    const missedWordCounts = {};
    const missedWords = [];
    let totalCount = 0;
    for( const p of progress ) {
        const history = p.history;
        for( const h of history ) {
            if( h.evaluation.missedWords ) {
                const words = h.evaluation.missedWords.split(',').map(t => t.trim())
                for( const w of words ) {
                    if( !missedWordCounts[w] ) {
                        missedWordCounts[w] = 0;
                        missedWords.push(w);
                    }
                    missedWordCounts[w]++; 
                    totalCount++;
                }
            }
        }
    }
    missedWords.sort( (a,b) => missedWordCounts[a] > missedWordCounts[b] );

    return {
        missedWordCounts,
        missedWords,
        totalCount
    }
}

