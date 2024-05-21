export default function float_equal(x: number, y: number): boolean {
  return Math.abs(x - y) < Number.EPSILON;
}