import { round } from "./Utils.js";

export class MultiPolarsFormat {

  constructor(polars) {
    this._polars = polars;
  }

  toString() {
    let result = this._renderHeader()
    this._polars.forEach( polarLine => {
      result += this._renderPolarLine(polarLine);
    });
    return result;
  }

  _renderHeader() {
    let maxLength = this._polars.reduce( (a,b) => Math.max(a, b.length()), 0);
    let header = "pol";
    for (let i=0; i < maxLength; i++) {
      header += "\tTwa" + i + "\tBs" + i;
    }
    return header;
  }

  _renderPolarLine(polarLine) {
    let line = "\n";
    line += round(polarLine.windspeed(), 0);
    
    for (let i=0; i<polarLine.length(); i++) {
      let pol = polarLine.get(i);
      line += "\t" + round(pol.angle, 0);
      line += "\t" + round(pol.radius, 1);
    }
    return line;
  }
}