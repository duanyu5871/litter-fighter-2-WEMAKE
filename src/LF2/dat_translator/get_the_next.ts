import { INextFrame } from "../defines/INextFrame";
import { Defines } from "../defines/defines";

export const get_next_frame_by_raw_id = (id: number | string): INextFrame => {
  if ('' + id === '1000') return { id: Defines.FrameId.Gone };
  if ('' + id === '999') return { id: Defines.FrameId.Auto };
  if ('' + id === '-999') return { id: Defines.FrameId.Auto, facing: Defines.FacingFlag.Backward };
  if ('' + id === '0') return {};

  if (typeof id === 'number') {
    if (id >= 1100 && id <= 1299) // 外部需要处理隐身逻辑。
      return { id: Defines.FrameId.Auto }
    if (id <= -1100 && id >= -1299) // 外部需要处理隐身逻辑。
      return { id: Defines.FrameId.Auto, facing: Defines.FacingFlag.Backward };
    if (id < 0)
      return { id: '' + (-id), facing: Defines.FacingFlag.Backward }
  }
  if (typeof id === 'string' && id.startsWith('-'))
    return { id: id.substring(1), facing: Defines.FacingFlag.Backward }
  return { id: '' + id };
};
