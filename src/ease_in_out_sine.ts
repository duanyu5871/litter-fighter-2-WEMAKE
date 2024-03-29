export function ease_in_out_sine(x: number): number {
  return -(Math.cos(Math.PI * x) - 1) / 2;
}
