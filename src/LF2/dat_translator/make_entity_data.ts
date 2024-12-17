import { IEntityData } from "../defines";
import { IEntityInfo } from "../defines/IEntityInfo";
import { IFrameInfo } from "../defines/IFrameInfo";

export function make_entity_data(info: IEntityInfo, frames: Record<string, IFrameInfo>): IEntityData {
  const ret: IEntityData = {
    id: '',
    type: 'entity',
    base: info,
    frames: frames,
    is_entity_data: true
  };
  return ret;
}
