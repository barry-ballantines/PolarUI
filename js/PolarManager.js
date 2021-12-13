import { MultiPolarsFormat } from "./MultiPolarsFormat.js";
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
    this.uiRefreshStoredPolarsOutput();
    this.uiRefreshCurrentPolarLoadStoreBtns();
  }

  sortPolarLines() {
    this._polarLines.sort( (a, b) => a.windspeed() - b.windspeed() );
  }

  currentWindspeed() {
    let ws = parseInt(this._uiCurrentPolarWindspeedTF.value.trim());
    return (isNaN(ws)) ? undefined : ws;
  }

  uiRegisterComponents() {

    this._uiCurrentPolarEditor = document.querySelector("#currentPolar_editor");
    this._uiCurrentPolarWindspeedTF = document.querySelector("#currentPolar_windspeed");
    this._uiCurrentPolarStoreBtn = document.querySelector("#currentPolar_store");
    this._uiCurrentPolarLoadBtn = document.querySelector("#currentPolar_load");
    this._uiCurrentPolarClearBtn = document.querySelector("#currentPolar_clear");
    this._uiCurrentPolarRefreshBtn = document.querySelector("#currentPolar_refresh");
    this._uiStoredPolarsOutput = document.querySelector("#storedPolars_output");

    this._uiCurrentPolarWindspeedTF.addEventListener("change", evt => {
      this.uiRefreshCurrentPolarLoadStoreBtns();
      let ws = this.currentWindspeed();
      if (!ws) {
        this._current.setWindspeed(null);
      } 
      else {
        this._current.setWindspeed(ws);
      }
    });

    this._uiCurrentPolarClearBtn.addEventListener("click", evt => {
      this._current.clear();
      this._uiCurrentPolarWindspeedTF.value = "";
      this.uiRefreshCurrentPolarLoadStoreBtns();
      this.uiRefreshCurrentPolarEditor()
      window.polarCanvas.redraw();
    });

    this._uiCurrentPolarRefreshBtn.addEventListener("click", evt => {
      let text = this._uiCurrentPolarEditor.value;
      let format = new SinglePolarFormat(this._current);
      format.fromString(text);
      this.uiRefreshCurrentPolarEditor();
      window.polarCanvas.redraw();
    });

    this._uiCurrentPolarStoreBtn.addEventListener("click", evt => {
      this.storeCurrent();
    });

    this._uiCurrentPolarLoadBtn.addEventListener("click", evt => {
      let ws = this.currentWindspeed();
      if (!ws) {
        return;
      }
      
      let polarLine = this._polarLines.find(item => item.windspeed()==ws);
      if (polarLine) {
        this._current = polarLine.clone();
        this.uiRefreshCurrentPolarEditor();
        window.polarCanvas.redraw();
      }
    });

    this._uiStoredPolarsOutput.addEventListener("change", evt => {
      let text = this._uiStoredPolarsOutput.value;
      let parser = new MultiPolarsFormat(this._polarLines);
      parser.fromString(text);
      this.uiRefreshStoredPolarsOutput();
    });

    this.uiRefreshCurrentPolarEditor();
  }

  uiRefreshCurrentPolarLoadStoreBtns() {
    let ws = this.currentWindspeed()
    if (!ws) {
      this._uiCurrentPolarStoreBtn.disabled = true;
      this._uiCurrentPolarLoadBtn.disabled = true;
    }
    else {
      this._uiCurrentPolarStoreBtn.disabled = false;
      if (this._polarLines.some(item => item.windspeed() == ws)) {
        this._uiCurrentPolarLoadBtn.disabled = false;
      } else {
        this._uiCurrentPolarLoadBtn.disabled = true;
      }
    }
  }

  
  uiRefreshCurrentPolarEditor() {
    this._uiCurrentPolarEditor.value = "TWA\tBS\r" + (new SinglePolarFormat(this._current)).toString();
  }

  uiRefreshStoredPolarsOutput() {
    this._uiStoredPolarsOutput.value = (new MultiPolarsFormat(this._polarLines)).toString();
  }
}

window.polarManager = new PolarManager();