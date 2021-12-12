import { CanvasUI } from "./CanvasUI.js";
import { Settings } from "./Settings.js";
import { CoordinateConverter } from "./CoordinateConverter.js";

class PolarCanvas {

    constructor() {
        this._calibrationValue = 20.0;
        this._coords = new CoordinateConverter(this);
        
        this.uiRegisterComponents();

        this.resetCalibration();
    }

    uiRegisterComponents() {
        
        this._image = undefined;
        this._canvas = document.querySelector("#canvas");
        this._debug = document.querySelector("#debug");
        
        this._ui = new CanvasUI(this._canvas);

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
            this._canvas.title = "BS: " + this.round(pos.radius, 1) + ", TWA: " + this.round(pos.angle, 0) + "° "
        });

        this._canvas.addEventListener("mousedown", evt => {
            let pol = this.getCalibratedPolarMousePosition(evt);
            window.polarManager.current().addPolar(pol);
            window.polarManager.uiRefreshCurrentPolarEditor();
            this.redraw();
        });

        this.uiRegisterCalibrationButtons("#centerX", increment => { this._centerX += increment; });
        this.uiRegisterCalibrationButtons("#centerY", increment => { this._centerY += increment; });
        this.uiRegisterCalibrationButtons("#calibrateR", increment => { this._calibrationR += increment; });
        this.uiRegisterCalibrationButtons("#calibrateE", increment => { this._calibrationE += increment; });
    }

    uiRegisterCalibrationButtons(label, callback) {
        this.uiRegisterCalibrationButton(label + "Decr10", -10, callback);
        this.uiRegisterCalibrationButton(label + "Decr1", -1, callback);
        this.uiRegisterCalibrationButton(label + "Incr1", +1, callback);
        this.uiRegisterCalibrationButton(label + "Incr10", +10, callback);
    }

    uiRegisterCalibrationButton(label, increment, callback) {
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
        this.uiClearCanvas();
        this.uiDrawImage();
        this.uiDrawCalibrationLines();
        this.uiDrawPolarLine();
    }

    uiClearCanvas() {
        this._ui.clear();
    }

    uiDrawImage() {
        if (this._image) {
            this._ui.drawImage(this._image);
        } else {
            this._ui.drawCenterText("Load Polar Diagram");
        }
    }

    uiDrawCalibrationLines() {

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

    uiDrawPolarLine() {
        if (!window.polarManager) return;

        let polarLine = window.polarManager.current();
        if (polarLine.length()<2) return;

        let ctx = this._ui._ctx;
        ctx.beginPath();
        ctx.strokeStyle = Settings.polarline_color;
        ctx.lineWidth = 1;

        let pol = polarLine.get(0);
        let pos = this._coords.polarToCartesian(pol);

        ctx.moveTo(pos.x, pos.y);
        for (let i=1; i<polarLine.length(); i++) {
            let previousPol = pol;
            pol = polarLine.get(i);
            pos = this._coords.polarToCartesian(pol);
            
            let dAngle = pol.angle - previousPol.angle;
            let dRadius = pol.radius - previousPol.radius;
            let m = dRadius/dAngle;

            for (let a=previousPol.angle + 1; a<=pol.angle; a++) {
                let npol = {
                    angle: a,
                    radius: previousPol.radius + m * (a - previousPol.angle)
                }
                let npos = this._coords.polarToCartesian(npol);
                ctx.lineTo(npos.x, npos.y);
            }


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