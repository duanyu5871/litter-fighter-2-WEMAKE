import { value_animating } from "./value_animating";
export function fade_out(
  fun: (opacity: number) => void,
  duration: number,
  delay: number = 0,
): () => void {
  return () => value_animating(1, 0, fun, duration, delay);
}
export default fade_out;