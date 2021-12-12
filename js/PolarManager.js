import { PolarLine } from "./PolarLine.js";
import { SinglePolarFormat } from "./SinglePolarFormat.js";

export class PolarManager {

  constructor() {

    /** list of polar lines, sorted by windspeed **/
    this._polarLines = [];

    /** the polar line that is currently edited **/
    this._current = new PolarLine();


    this.uiRegisterComponents();
  }

  current() {
    return this._current;
  }

  newCurrent() {
    this._current = new PolarLine();
    return this._current;
  }

  storeCurrent() {
    if (! this._current.windspeed()) return;  
    let windspeed = this._current.windspeed();
    let index = this._polarLines.findIndex( element => element.windspeed() == windspeed );
    if (index>-1) {
      this._polarLines[index] = this._current.clone();
    }
    else {
      this._polarLines.push( this._current.clone());
      this.sortPolarLines();
    }
    this.uiRrefreshPolarLines();
  }

  sortPolarLines() {
    this._polarLines.sort( (a, b) => a.windspeed() - b.windspeed() );
  }

  uiRegisterComponents() {

    this._uiCurrentPolarEditor = document.querySelector("#currentPolar_editor");

    document.querySelector("#currentPolar_clear").addEventListener("click", evt => {
      this._current.clear();
      this.uiRefreshCurrentPolarEditor()
      window.polarCanvas.redraw();
    });

    document.querySelector("#currentPolar_refresh").addEventListener("click", evt => {
      let text = this._uiCurrentPolarEditor.value;
      let format = new SinglePolarFormat(this._current);
      format.fromString(text);
      this.uiRefreshCurrentPolarEditor();
      window.polarCanvas.redraw();
    });

    this.uiRefreshCurrentPolarEditor();
  }

  
  uiRefreshCurrentPolarEditor() {

    this._uiCurrentPolarEditor.value = "TWA\tBS\r" + (new SinglePolarFormat(this._current)).toString();
  }

  uiRrefreshPolarLines() {
    // TODO...
  }
}

window.polarManager = new PolarManager();