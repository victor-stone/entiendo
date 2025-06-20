import jspath from 'jspath'


export default class query {
    constructor(data) {
        this.data = data;
    }

    q(q, subs = null, data = null) {
        if( !data ) {
            data = this.data;
        }
        try {
            const result = jspath(q, data, subs) || [];
            return result;
        } catch(err) {
            console.error('JSPATH Parse error for ', q);
            return [];
        }
    }

    queryOne(q, subs = null ) {
        return this.q(q,subs)[0];
    }

}