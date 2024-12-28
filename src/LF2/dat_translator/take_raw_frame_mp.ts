import { is_num } from "../utils/type_check";
import { take } from "./take";

export function take_raw_frame_mp(frame: any): [number, number] {
  const mp = take(frame, "mp");
  if (!is_num(mp)) return [0, 0];
  if (mp < 1000 && mp > -1000) return [mp, 0];
  const _mp = mp % 1000;
  const hp = (mp - _mp) / 100;
  return [_mp, hp];
}
