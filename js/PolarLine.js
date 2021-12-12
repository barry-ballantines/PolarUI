import { round } from "./Utils.js";

export class PolarLine {

  constructor() {
    this._windspeed = undefined;

    this.clear();
  }

  clone() {
    let that = new PolarLine();
    that._windspeed = this._windspeed;
    that._polars = [ ... this._polars ];
    return that;
  }

  windspeed() {
    return this._windspeed;
  }

  setWindspeed(windspeed) {
    this._windspeed = windspeed;
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
  
}