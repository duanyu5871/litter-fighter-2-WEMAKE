import { INextFrame } from "../lf2_type";
import { Defines } from "../lf2_type/defines";

export const get_next_frame_by_id = (id: number | string): INextFrame => {
  if (id === 1000) return { id: Defines.ReservedFrameId.Gone };
  if (id === 999) return { id: Defines.ReservedFrameId.Auto };
  if (id === -999) return { id: Defines.ReservedFrameId.Auto, facing: Defines.FacingFlag.Backward };
  if (id === 0) return { };
  if (typeof id === 'number' && id < 0)
    return { id: '' + (-id), facing: Defines.FacingFlag.Backward }
  if (typeof id === 'string' && id.startsWith('-'))
    return { id: id.substring(1), facing: Defines.FacingFlag.Backward }
  return { id: '' + id };
};
