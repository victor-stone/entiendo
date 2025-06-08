import jspath from 'jspath'


export default class query {
    constructor(data) {
        this.data = data;
    }

    q(q, data = null) {
        if( !data ) {
            data = this.data;
        }
        try {
            const result = jspath(q,data) || [];
            return result;
        } catch(err) {
            console.error('JSPATH Parse error for ', q);
            return [];
        }
    }

    queryOne(q) {
        return this.q(q)[0];
    }

}