import { CanvasUI } from "./CanvasUI.js";
import { Settings } from "./Settings.js";
import { CoordinateConverter } from "./CoordinateConverter.js";

class PolarCanvas {

    constructor() {
        this._canvas = document.querySelector("#canvas");

        this._debug = document.querySelector("#debug");

        this._image = undefined;

        this._ui = new CanvasUI(this._canvas);

        this.resetCalibration();

        this._calibrationValue = 20.0;

        this._coords = new CoordinateConverter(this);

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

        this.registerCalibrationButtons("#centerX", increment => { this._centerX += increment; });
        this.registerCalibrationButtons("#centerY", increment => { this._centerY += increment; });
        this.registerCalibrationButtons("#calibrateR", increment => { this._calibrationR += increment; });
        this.registerCalibrationButtons("#calibrateE", increment => { this._calibrationE += increment; });
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