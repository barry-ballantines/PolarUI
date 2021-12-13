import { PolarLine } from "./PolarLine.js";
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

  fromString(text) {
    let newPolars = []
    let lines = text.split(/\n/);
    lines.forEach( line => {
      let polarLine = this._parseLine(line);
      if (polarLine) {
        newPolars.push(polarLine);
      }
    });
    newPolars.sort((a,b) => a.windspeed() - b.windspeed());

    // clear and refill...
    this._polars.length = 0;
    newPolars.forEach( item => { this._polars.push(item)});
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

  _parseLine(line) {
    let values = line.trim().split(/\s+/);
    if (values.length == 0 || values.length%2 == 0) {
      return undefined;
    }
    let ws = parseInt(values[0]);
    if (isNaN(ws)) {
      return undefined;
    }

    let polarLine = new PolarLine();
    polarLine.setWindspeed(ws);
    polarLine._polars = [];

    for (let i=1; i<values.length; i+=2) {
      let twa = parseInt(values[i]);
      let bs = parseFloat(values[i+1]);
      if (isNaN(twa) || isNaN(bs)) continue;
      else {
        polarLine.addPolar({
          angle: twa,
          radius: bs
        });
      }
    }
    return polarLine;
  }
}