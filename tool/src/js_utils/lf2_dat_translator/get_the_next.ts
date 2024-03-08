import { INextFrame } from "../lf2_type";
import { Defines } from "../lf2_type/defines";

export const get_next_frame_by_id = (id: number | string): INextFrame => {
  if (id === 1000) return { id: Defines.ReservedFrameId.Gone };
  if (id === 999) return { id: Defines.ReservedFrameId.Auto };
  if (id === -999) return { id: Defines.ReservedFrameId.Auto, turn: Defines.TurnFlag.Backward };
  if (id === 0) return { };
  if (typeof id === 'number' && id < 0)
    return { id: '' + (-id), turn: Defines.TurnFlag.Backward }
  if (typeof id === 'string' && id.startsWith('-'))
    return { id: id.substring(1), turn: Defines.TurnFlag.Backward }
  return { id: '' + id };
};
