import query from './query.js'
import { usageToPathRange } from './helpers.js';

const dateASC = (a,b) => a.dueDate - b.dueDate;

/*
    All of the methods here assume the data intializing this
    class is already filtered by user.

    This class should be really called PerUserProgressQuery

*/
export default class ProgressQuery extends query {
    constructor(data) {
        super(data,'progressId');
    }

    // for debugging...
    _limitToUser(userId) {
        this._data = this.q('..{.userId == $userId}', { userId } );
    }
    
    missedWords(unique) {        
        return unique  
                ? [... new Set(this.q('..missedWords'))].sort()
                : this.q('..missedWords');
    }

    idiomIds() {
        return [... new Set(this.q('..idiomId')) ]
    }

    exampleIds() {
        return [... new Set(this.q('..exampleId')) ]
    }

    _conditional(dateDir,tone,usage) {
        const conditions = []
        if( dateDir ) conditions.push(`.dueDate ${dateDir} ${Date.now()}`)
        if( tone )    conditions.push(`.tone =="${tone}"`);
        if( usage )   conditions.push(usageToPathRange(usage));
        const spec = `..{${conditions.join(' && ')}}`
        return this.q(spec).sort(dateASC);
    }

    nextDue(tone,usage) {
        return this._conditional('<',tone,usage)[0];
    }

    schedule(){ 
        return this.q('..{.dueDate}').sort(dateASC);
    }
    
    due() {
        return this._conditional('<')
    }

    upcoming() {
        return this._conditional('>')
    }
    
    idiomaticCreationDates() {
        return this.q('..{.idiomId}.createdAt');
    }

    forIdiom(idiomId) {
        return this.queryOne(`..{.idiomId == "${idiomId}"}`);
    }

    /* return an array of progress objects, each with its .history property filtered 
       to only include entries between the from and to dates. Any progress object with 
       no history entries in that range is excluded from the result. The function does 
       not return a flat list of history entries, but rather the filtered progress objects 
       themselves
    */
    history(from,to = Date.now()) {
        const prog = this.q('..{.progressId && !.isSandbox}');
        if( prog.length ) {
            const progress = JSON.parse(JSON.stringify(prog));
            return progress.filter( p => {
                p.history = p.history.filter(({date}) => date >= from && date <= to);
                return p.history.length > 0 ;
            });
        }
        return [];
    }

    sandboxes() {
        return this.q(`..{.isSandbox}`);
    }

    exampleById(exampleId) {
        return this.q(`..{.exampleId == "${exampleId}"}`)
    }

    firstBasedOnWord(word) {
        return this.firstBasedOn([word]);
    }

    sandboxExample(exampleId) {
        return this.queryOne(`..{.sandbox && .exampleId == "${exampleId}"}`)
    }
    
    sandbox(sandboxId) {
        return this.queryOne(`..{.progressId == "${sandboxId}"}`)
    }

    oldestSandboxExample(list) {
        if( !list.length ) {
            return null;
        }
        let expr = list
                    .map( w => `.missedWords == "${w}"`)
                    .join(' || ');
        // .sandbox && .evaluation{.missedWords == 'queda' || .missedWords == 'prendo'}                    
        expr = `{.sandbox && .evaluation{${expr}}}`
        list = this.q(`..${expr}`).sort((a,b) => a.date - b.date) || [];
        return list[0];
    }

}

    // missedWordsByMistakeType() {
    //     const obj = this.q('..evaluation').reduce( (dict,{mistakeType,missedWords}) => {
    //         if( missedWords.length ) {
    //             dict[mistakeType] = new Set( [ ...(dict[mistakeType] || []) , ...missedWords])
    //         }
    //         return dict; }, {});
    //     // Convert Set values to arrays before returning
    //     Object.keys(obj).forEach(key => {
    //         obj[key] = Array.from(obj[key]).sort();
    //     });
    //     console.log(obj);        
    //     return obj;
    // }

    // missedWordsCount() {
    //     return this.q('..missedWords').reduce( (obj, word) => {
    //         if( !obj[word] ) obj[word] = 0;
    //         ++obj[word];
    //         return obj;
    //     }, {})
    // }

    // exampleIdsThatMissedWord(word) {
    //     return this.q(`...history{.evaluation.missedWords === "${word}"}.exampleId`)
    // }
    
