export function round(value, decimalPoints = 0) {
  let factor = Math.pow(10, decimalPoints);
  return Math.round(value * factor) / factor;
}