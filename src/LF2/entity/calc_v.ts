import { SpeedMode } from "../defines";
/**
 * 计算新速度
 *
 * @export
 * @param {number} old 原速度值
 * @param {number} speed 新速度值
 * @param {SpeedMode} mode 速度模式
 * @param {(number | undefined)} acc 加速度
 * @param {(1 | -1)} [direction=1]
 * @return {*}  {number}
 */
export function calc_v(
  old: number,
  speed: number,
  mode: SpeedMode,
  acc: number | undefined,
  direction: 1 | -1 = 1): number {
  switch (mode) {
    case SpeedMode.Fixed: return speed;
    case SpeedMode.Extra: return old;
    case SpeedMode.FixedAcc: return old + speed;
    case SpeedMode.Acc: return old + speed * direction;
    case SpeedMode.FixedLf2: {
      return (speed > 0 && old < speed) || (speed < 0 && old > speed)
        ? speed
        : old;
    }
    case SpeedMode.AccTo: {
      speed *= direction;
      acc = acc ? acc * direction : void 0;
      if (!acc ||
        (speed > 0 && old >= speed) ||
        (speed < 0 && old <= speed) ||
        (speed > old && acc < 0) ||
        (speed < old && acc > 0))
        return old;
      return old + acc;
    }
    case SpeedMode.LF2:
    default:
      speed *= direction;
      return (speed > 0 && old < speed) || (speed < 0 && old > speed)
        ? speed
        : old;
  }
}
