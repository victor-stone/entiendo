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

    basedOn(list) {
        const expr = list.map( w => `.basedOn == "${w}"`).join(' || ');
        return this.q(`..{${expr}}`);
    }

    forIdiom(idiomId) {
        return this.q(`..{.idiomId == $idiomId}`, { idiomId });
    }

    example(exampleId) {
        return this.queryOne(`..{.exampleId == $exampleId}`, { exampleId });
    }

    assigned(source = null) {
    return source 
        ? this.q('..{.assigned.source == $source}', { source })
        : this.q('..{.assigned.source > ""} ');
    }

    basedOnWithAudio(list) {
        const wAudio = this.q('..{.audio.publicUrl}');
        const wAudioBOn = wAudio.filter( s => {
            if( s.basedOn?.length > 0 ) {
                return s.basedOn.some(word => list.includes(word));
            }
        });
        return wAudioBOn;
    }
}