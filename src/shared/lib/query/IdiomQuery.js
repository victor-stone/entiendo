import query from './query.js'
import { usageToPathRange } from './helpers.js';


export default class IdiomQuery extends query {
    constructor(data) {
        super(data,'idiomId');
    }

    idioms() { 
        return [...this.data];
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

    idiom(idiomId) {
        return this.queryOne(`..{.idiomId == "${idiomId}"}`);
    }

    byCriteria(tone,usage,field) {
        const member = field ? `.${field}` : '';
        const s = [];
        if( tone )  s.push( `.tone == "${tone}"`);
        if( usage ) s.push( usageToPathRange(usage) );
        const sp = `..{${s.join(' && ')}}${member}`;
        return this.q(sp);
    }

    containsText(text) {
        return this.q(`..{.text *= "${text}"}`)
    }

    matchText(text) {
        return this.queryOne(`..{.text == "${text}"}`)
    }

}
