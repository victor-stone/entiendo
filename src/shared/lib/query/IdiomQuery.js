import query from './query.js'
import { usageToPathRange } from './helpers.js';


export default class IdiomQuery extends query {
    constructor(data) {
        super(data,'idiomId');
    }

    idioms() { 
        return this.q('..{.idiomId}')
    }

    getIdiomsList() {
        return this.data.map( ({ idiomId, text }) => ({idiomId, text}));
    }

    tones() {
        return [... new Set(this.q('..tone')) ]
    }

    ids() {
        return this.q('..idiomId');
    }

    assigned(source = null) {
        return source 
            ? this.q('..{.assigned.source == $source}', { source })
            : this.q('..{.assigned.source} ');
    }

    idiom(idiomId) {
        return this.queryOne(`..{.idiomId == "${idiomId}"}`);
    }

    byCriteria(tone,usage,field) {
        const member = field ? `.${field}` : '';
        if( !tone && !usage ) {
            if(field) {
                return (this.q('..' + field));
            }
            return this.idioms();
        }
        const s = [];
        if( tone )  s.push( `.tone == "${tone}"`);
        if( usage ) s.push( usageToPathRange(usage) );
        const sp = `..{${s.join(' && ')}}${member}`;
        return this.q(sp);
    }

    containsText(text) {
        return this.q(`..{.text *= $text}`, { text })
    }

    matchText(text) {
        return this.queryOne(`..{.text == $text}`, { text })
    }

}
