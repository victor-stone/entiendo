import jspath from 'jspath'


export default class query {
    constructor(data, key) {
        this.data = data;
        this.key = key;
    }

    // base classes override this
    refresh(data) {
        this.data = data;
    }

    q(q) {
        try {
            const result = jspath(q,this.data) || [];
            return result;
        } catch(err) {
            console.error('JSPATH Parse error for ', q);
            console.error(err);
            return [];
        }
    }

    queryOne(q) {
        return this.q(q)[0];
    }

    getKeys() {
        return this.q(`..${this.key}`);
    }
}