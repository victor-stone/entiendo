import query from './query.js'
import { usageToPathRange } from './helpers.js';

const dateASC = (a,b) => a.dueDate - b.dueDate;

export default class ProgressQuery extends query {
    constructor(data) {
        super(data,'progressId');
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

    sandbox() {
        return this.queryOne(`..{.isSandbox}`);
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
    
