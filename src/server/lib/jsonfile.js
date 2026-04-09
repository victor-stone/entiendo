import fs from "fs";

const DATA_DIR = 'data/';
const _path = (name) => name.includes('/') ? name : DATA_DIR + name;

export default class JsonFile {
  constructor(path) {
    this.path = _path(path);
  }

  open() {
      const body = fs.readFileSync(this.path, "utf8");
      this.data = JSON.parse(body);
  }

  write() {
    const data = this.data;
    fs.writeFileSync(this.path, JSON.stringify(data, null, 2), 'utf8');
  }

}