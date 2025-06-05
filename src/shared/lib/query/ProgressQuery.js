import query from './query.js'

export default class ProgressQuery extends query {
    constructor(data) {
        super(data,'progressId');
    }

    missedWords(unique) {        
        return unique  
                ? [... new Set(this.q('..missedWords'))].sort()
                : this.q('..missedWords');
    }

    missedWordsCount() {
        return this.q('..missedWords').reduce( (obj, word) => {
            if( !obj[word] ) obj[word] = 0;
            ++obj[word];
            return obj;
        }, {})
    }

    missedWordsByMistakeType() {
        const obj = this.q('..evaluation').reduce( (dict,{mistakeType,missedWords}) => {
            if( missedWords.length ) {
                dict[mistakeType] = new Set( [ ...(dict[mistakeType] || []) , ...missedWords])
            }
            return dict; }, {});
        // Convert Set values to arrays before returning
        Object.keys(obj).forEach(key => {
            obj[key] = Array.from(obj[key]).sort();
        });
        console.log(obj);        
        return obj;
    }

    exampleIdsThatMissedWord(word) {
        return this.q(`...history{.evaluation.missedWords === "${word}"}.exampleId`)
    }
    
    idiomIds() {
        return [... new Set(this.q('..idiomId')) ]
    }

    exampleIds() {
        return [... new Set(this.q('..exampleId')) ]
    }

    _date(dir) {
        return this.q(`..{.dueDate ${dir} ${Date.now()}}`).sort( (a,b) => a.dueDate - b.dueDate);
    }

    due() {
        return this._date('<')
    }

    upcoming() {
        return this._date('>')
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