
const _ = o => o != null ? JSON.parse(JSON.stringify(o)) : null;

export default class Idioms {
  constructor(data) {
    this.data = data;
  }

  find(id) {
    return _(this.data.find( i => i.idiomId == id ));
  }  

  containsText(text) {
    return _(this.data.filter( i => i.text.toLowerCase().includes(text.toLowerCase()) ));
  }
}