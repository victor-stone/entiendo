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
        return (this.data && jspath(q,this.data)) || [];
    }

    queryOne(q) {
        return this.q(q)[0];
    }

    getKeys() {
        return this.q(`..${this.key}`);
    }
}