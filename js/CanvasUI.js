export class CanvasUI {

    constructor(canvas) {
        this._canvas = canvas;
        this._ctx = canvas.getContext("2d");
        this.width = this._canvas.width;
        this.height = this._canvas.height;
    }

    clear() {
        this._ctx.clearRect(0, 0, this._ctx.canvas.width, this._ctx.canvas.height);
    }
    
    drawHorizontalLine(y, style = 'black', width = 1) {
        this.drawLine(0, y, this._canvas.width, y, style, width);
    }

    drawVerticalLine(x, style = 'black', width = 1) {
        this.drawLine(x, 0, x, this._canvas.height, style, width);
    }

    drawLine(ax, ay, bx, by, style = 'black', width = 1) {
        let ctx = this._ctx;
        ctx.strokeStyle = style;
        ctx.lineWidth = width;
        ctx.beginPath();
        ctx.moveTo(ax, ay);
        ctx.lineTo(bx, by);
        ctx.stroke();
    }

    drawCircle(cx, cy, r, style = 'black', width = 1) {
        let ctx = this._ctx;
        ctx.beginPath();
        ctx.strokeStyle = style;
        ctx.lineWidth = width;
        ctx.arc(cx, cy, r, 0, 2*Math.PI);
        ctx.stroke();
    }

    
    drawEllipse(cx, cy, rx, ry, style = 'black', width = 1) {
        let ctx = this._ctx;
        ctx.beginPath();
        ctx.strokeStyle = style;
        ctx.lineWidth = width;
        ctx.ellipse(cx, cy, rx, ry, 0, 0, 2*Math.PI);
        ctx.stroke();
    }

    drawImage(image, x=0, y=0) {
        this._ctx.drawImage(image, x, y);
    }

    drawCenterText(text, font="30px Arial") {
        this._ctx.font = font;
        this._ctx.fillStyle = "lightgray";
        this._ctx.textAlign = "center";
        this._ctx.textBaseline = "middle";
        this._ctx.fillText(text, this.width/2, this.height/2);
    }

    getMousePosition(evt) {
        var rect = this._canvas.getBoundingClientRect();
        return {
            x: evt.clientX - rect.left,
            y: evt.clientY - rect.top
        };
    }
}