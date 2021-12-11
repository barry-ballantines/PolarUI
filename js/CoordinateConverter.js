export class CoordinateConverter {
  
  constructor(parent) {
    this._parent = parent;
  }

  cartesianToCentric(cartesian) {
    return {
        x: cartesian.x - this._parent._centerX,
        y: this._parent._centerY - cartesian.y
    };
  }

  centricToCartesian(centric) {
    return {
        x: centric.x + this._parent._centerX,
        y: this._parent._centerY - centric.y
    };
  }
  
  centricToPolar(centric) {
    let ry = this._parent._calibrationR;
    let rx = this._parent._calibrationR + this._parent._calibrationE;

    let cx = this._parent._calibrationValue * centric.x / rx;
    let cy = this._parent._calibrationValue * centric.y / ry;

    let radius = Math.sqrt(cx * cx + cy * cy);
    let angle = Math.atan2(cx, cy);

    return {
        radius: radius,
        angle: 180 * angle / Math.PI
    };
  }

  polarToCentric(polar) {    
    let multiplier_y = this._parent._calibrationR;
    let multiplier_x = this._parent._calibrationR + this._parent._calibrationE;

    let r_norm = polar.radius / this._parent._calibrationValue;
    let angle_rad = polar.angle / 180 * Math.PI;

    return {
        x: r_norm * Math.sin(angle_rad) * multiplier_x,
        y: r_norm * Math.cos(angle_rad) * multiplier_y
    };
  }
}