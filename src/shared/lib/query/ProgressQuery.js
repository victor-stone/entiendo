import query from './query.js'
import { usageToPathRange } from './helpers.js';

const dateASC = (a,b) => a.dueDate - b.dueDate;

export default class ProgressQuery extends query {
    constructor(data) {
        super(data,'progressId');
    }

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
    
