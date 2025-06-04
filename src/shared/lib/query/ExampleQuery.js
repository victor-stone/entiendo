import query from './query.js'

export default class ExampleQuery extends query {
    constructor(data) {
        super(data,'exampleId');
    }

    missedWords() {
        return [... new Set(this.q('..missedWords'))].sort();        
    }

    idiomIds() {
        return [... new Set(this.q('..idiomId')) ]
    }

    exampleIds() {
        return [... new Set(this.q('..exampleId')) ]
    }

}