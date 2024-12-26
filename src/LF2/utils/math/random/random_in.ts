export function random_in(a: number, b: number): number {
  if (a > b) return random_in(b, a);
  return a + (b - a) * Math.random();
}
export function mid(a: number, b: number): number {
  if (a > b) return mid(b, a);
  return a + (b - a) * 0.5;
}