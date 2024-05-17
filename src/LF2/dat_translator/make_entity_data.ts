import { IGameObjInfo, IEntityData } from "../defines";
import { IFrameInfo } from "../defines/IFrameInfo";

export function make_entity_data(info: IGameObjInfo, frames: Record<string, IFrameInfo>): IEntityData {
  const ret: IEntityData = {
    id: '',
    type: 'entity',
    base: info,
    frames: frames,
    is_entity_data: true,
    is_game_obj_data: true,
    is_base_data: true
  };
  return ret;
}
