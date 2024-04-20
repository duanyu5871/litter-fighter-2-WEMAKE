import { IGameObjInfo, IEntityData } from "../lf2_type";
import { IFrameInfo } from "../lf2_type/IFrameInfo";

export function make_entity_data(info: IGameObjInfo, frames: Record<string, IFrameInfo>): IEntityData {
  return {
    id: '',
    type: 'entity',
    base: info,
    frames: frames
  };
}
