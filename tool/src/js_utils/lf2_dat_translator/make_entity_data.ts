import { IGameObjInfo, IFrameInfo, IEntityData } from "../lf2_type";

export function make_entity_data(info: IGameObjInfo, frames: Record<string, IFrameInfo>): IEntityData {
  return {
    id: '',
    type: 'entity',
    base: info,
    frames: frames
  };
}
