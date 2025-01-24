import value_animating from "./value_animating";

export function fade_in(
  fun: (opacity: number) => void,
  duration: number = 255,
  delay: number = 0
): () => void {
  return value_animating(0, 1, fun, duration, delay);
}
export default fade_in;