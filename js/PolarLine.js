import { round } from "./Utils.js";

export class PolarLine {

  constructor() {
    this.clear();
  }

  length() {
    return this._polars.length;
  }

  get(index) {
    if (index<0 || index >= this._polars.length) return undefined;
    return this._polars[index];
  }

  clear() {
    this._polars = [ { angle: 0, radius: 0 }];
  }

  addPolar(pol) {
    this._polars.push(pol);
    this.sort();
  }

  sort() {
    this._polars.sort( (a, b) => { return a.angle - b.angle })
  }

  toText() {
    let text="";
    for (let i=0; i<this._polars.length; i++) {
      let pol = this._polars[i];
      text += round(pol.angle, 0);
      text += "\t";
      text += round(pol.radius, 1);
      text += "\n";
    }
    return text;
  }

  fromText(text) {
    this._polars = []
    let pairs = text.split(/\n/);
    pairs.forEach(value => {
      let angleRadius = value.split(/\t/);
      if (angleRadius.length==2) {
        let pol = {
          angle: parseInt(angleRadius[0].trim()),
          radius: parseFloat(angleRadius[1].trim())
        };
        this._polars.push(pol);
      }    
    });
    this.sort();
  }
}