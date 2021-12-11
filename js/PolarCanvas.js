import { CanvasUI } from "./CanvasUI.js";
import { Settings } from "./Settings.js";
import { CoordinateConverter } from "./CoordinateConverter.js";
import { PolarLine } from "./PolarLine.js";

class PolarCanvas {

    constructor() {
        this._canvas = document.querySelector("#canvas");

        this._debug = document.querySelector("#debug");

        this._polarOutputEL = document.querySelector("#polarText");

        this._image = undefined;

        this._ui = new CanvasUI(this._canvas);

        this.resetCalibration();

        this._calibrationValue = 20.0;

        this._coords = new CoordinateConverter(this);

        this._polarLine = new PolarLine();

        document.querySelector("#fileUpload").addEventListener("change", (evt) => {
            let target = evt.currentTarget;
            if (!target.files || !target.files[0]) return;
            const fileReader = new FileReader();
            fileReader.addEventListener("load", (evt) => {
                this._image = new Image();
                this._image.addEventListener("load", () => {
                    this._canvas.width = this._image.width;
                    this._canvas.height = this._image.height;
                    this.resetCalibration();
                    this.redraw();
                });
                this._image.src = evt.target.result;
            });
            fileReader.readAsDataURL(target.files[0])

        });

        document.querySelector("#calibrationValue").addEventListener("change", (evt) => {
            this._calibrationValue = parseInt(evt.currentTarget.value);
            this.redraw();
        });

        this._canvas.addEventListener("mousemove", evt => {
            let pos = this.getCalibratedPolarMousePosition(evt);
            let coords = this.getCentricMousePosition(evt);
            this._debug.innerHTML = "Pos: (BS: " + this.round(pos.radius, 1) + ", TWA: " + this.round(pos.angle, 0) + "°) <br />"
                + "Coords: (" + coords.x + ", " + coords.y + ")";
            this._canvas.title = "BS: " + this.round(pos.radius, 1) + ", TWA: " + this.round(pos.angle, 0) + "° "
        });

        this._canvas.addEventListener("mousedown", evt => {
            let pol = this.getCalibratedPolarMousePosition(evt);
            this._polarLine.addPolar(pol);
            this.redraw();
            this.refreshPolarOutput();
        });

        this.registerCalibrationButtons("#centerX", increment => { this._centerX += increment; });
        this.registerCalibrationButtons("#centerY", increment => { this._centerY += increment; });
        this.registerCalibrationButtons("#calibrateR", increment => { this._calibrationR += increment; });
        this.registerCalibrationButtons("#calibrateE", increment => { this._calibrationE += increment; });

        document.querySelector("#clearPolar").addEventListener("click", evt => {
            this._polarLine.clear();
            this.redraw();
            this.refreshPolarOutput();
        });

        document.querySelector("#reloadPolar").addEventListener("click", evt => {
            let text = this._polarOutputEL.value;
            this._polarLine.fromText(text);
            this.redraw();
            this.refreshPolarOutput();
        });
    }

    registerCalibrationButtons(label, callback) {
        this.registerCalibrationButton(label + "Decr10", -10, callback);
        this.registerCalibrationButton(label + "Decr1", -1, callback);
        this.registerCalibrationButton(label + "Incr1", +1, callback);
        this.registerCalibrationButton(label + "Incr10", +10, callback);
    }

    registerCalibrationButton(label, increment, callback) {
        let button = document.querySelector(label);
        button.addEventListener("click", evt => {
            callback(increment);
            this.redraw();
        });
    }

    resetCalibration() {
        this._centerX = parseInt(this._canvas.width / 2, 10);
        this._centerY = parseInt(this._canvas.height / 2, 10);
        this._calibrationR = parseInt(0.9 * this._canvas.width / 2, 10);
        this._calibrationE = 0.;
    }

    redraw() {
        this.clearCanvas();
        this.drawImage();
        this.drawCalibrationLines();
        this.drawPolarLine();
    }

    refreshPolarOutput() {
        this._polarOutputEL.value = this._polarLine.toText();
    }

    clearCanvas() {
        this._ui.clear();
    }

    drawImage() {
        if (this._image) {
            this._ui.drawImage(this._image);
        } else {
            this._ui.drawCenterText("Load Polar Diagram");
        }
    }

    drawCalibrationLines() {

        this._ui._ctx.setLineDash([8, 4]);
        // draw center
        this._ui.drawHorizontalLine(this._centerY, Settings.calibration_center_color);
        this._ui.drawVerticalLine(this._centerX, Settings.calibration_center_color);

        // draw calibration lines
        let ry = this._calibrationR;
        let rx = ry + this._calibrationE;
        this._ui.drawHorizontalLine(this._centerY - ry, Settings.calibration_box_color);
        this._ui.drawHorizontalLine(this._centerY + ry, Settings.calibration_box_color);
        this._ui.drawVerticalLine(this._centerX + rx, Settings.calibration_box_color);

        // draw calibration circle
        this._ui._ctx.setLineDash([4, 4]);
        this._ui.drawEllipse(
            this._centerX, this._centerY, 
            rx, ry,
            Settings.calibration_circle_color);

        this._ui._ctx.setLineDash([]);
    }

    drawPolarLine() {
        if (this._polarLine.length()<2) return;

        let ctx = this._ui._ctx;
        ctx.beginPath();
        ctx.strokeStyle = Settings.polarline_color;
        ctx.lineWidth = 1;

        let pos = this._coords.polarToCartesian(this._polarLine.get(0));
        ctx.moveTo(pos.x, pos.y);
        for (let i=1; i<this._polarLine.length(); i++) {
            let previousPos = pos;
            pos = this._coords.polarToCartesian(this._polarLine.get(i));
            ctx.lineTo(pos.x, pos.y);
            ctx.arc(pos.x, pos.y, 2, 0, 2*Math.PI);
            ctx.moveTo(pos.x, pos.y);
        }
        ctx.stroke();

    }

    getCentricMousePosition(evt) {
        let pos = this._ui.getMousePosition(evt);
        return this._coords.cartesianToCentric(pos);
    }

    getCalibratedPolarMousePosition(evt) {
        let pos = this.getCentricMousePosition(evt);
        
        return this._coords.centricToPolar(pos);
    }

    round(value, decimalPoints = 0) {
        let factor = Math.pow(10, decimalPoints);
        return Math.round(value * factor) / factor;
    }

}

window.polarCanvas = new PolarCanvas();
window.polarCanvas.redraw();