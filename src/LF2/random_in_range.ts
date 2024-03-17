export function random_in_range(a: number, b: number): number {
  if (a > b) return random_in_range(b, a);
  return a + (b - a) * Math.random();
}
