import { INextFrame } from "../defines/INextFrame";
import { Defines } from "../defines/defines";

export function cook_next_frame_mp_hp(ret: INextFrame, type?: 'next' | 'hit', frame_mp_hp_map?: Map<string, [number, number]>) {
  if (!frame_mp_hp_map) return;
  if (typeof ret.id !== 'string') return;
  const [mp, hp] = frame_mp_hp_map.get(ret.id) || [0, 0];
  if (type === 'hit') {
    if (mp > 0) ret.mp = mp;
    if (hp > 0) ret.hp = hp;
  } else if (type === 'next') {
    if (mp < 0) ret.mp = -mp;
    if (hp < 0) ret.hp = -hp;
  }
}

export const get_next_frame_by_raw_id = (id: number | string, type?: 'next' | 'hit', frame_mp_hp_map?: Map<string, [number, number]>): INextFrame => {
  if ('' + id === '1000') return { id: Defines.FrameId.Gone };
  if ('' + id === '999') return { id: Defines.FrameId.Auto };
  if ('' + id === '-999') return { id: Defines.FrameId.Auto, facing: Defines.FacingFlag.Backward };
  if ('' + id === '0') return {};

  if (typeof id === 'number') {
    if (id >= 1100 && id <= 1299) {
      // 外部需要处理隐身逻辑。
      return { id: Defines.FrameId.Auto }
    }
    if (id <= -1100 && id >= -1299) {
      // 外部需要处理隐身逻辑。
      return { id: Defines.FrameId.Auto, facing: Defines.FacingFlag.Backward };
    }
    if (id < 0) {
      const ret: INextFrame = { id: '' + (-id), facing: Defines.FacingFlag.Backward }
      cook_next_frame_mp_hp(ret, type, frame_mp_hp_map)
      return ret
    }
  }
  if (typeof id === 'string' && id.startsWith('-')) {
    const ret: INextFrame = { id: id.substring(1), facing: Defines.FacingFlag.Backward }
    cook_next_frame_mp_hp(ret, type, frame_mp_hp_map)
    return ret;
  }
  const ret: INextFrame = { id: '' + id }
  cook_next_frame_mp_hp(ret, type, frame_mp_hp_map)
  return ret;
};
