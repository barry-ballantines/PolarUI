import { round } from "./Utils.js";

export class SinglePolarFormat {

  constructor(polarLine) {
    this._polarLine = polarLine;
  }

  toString() {
    let text="";
    for (let i=0; i<this._polarLine.length(); i++) {
      let pol = this._polarLine.get(i);
      text += round(pol.angle, 0);
      text += "\t";
      text += round(pol.radius, 1);
      text += "\n";
    }
    return text;
  }

  fromString(text) {
    let polars = [];
    let pairs = text.split(/\n/);
    pairs.forEach(value => {
      let angleRadius = value.split(/\s+/);
      if (angleRadius.length==2) {
        let pol = {
          angle: parseInt(angleRadius[0].trim()),
          radius: parseFloat(angleRadius[1].trim())
        };
        if (!isNaN(pol.angle) && !isNaN(pol.radius)) {
          polars.push(pol);
        }
      }    
    });
    this._polarLine._polars = polars;
    this._polarLine.sort();
  }
}