import { IEntityData } from "../defines/IEntityData";
import { EntityEnum } from "../defines/EntityEnum";
import { IEntityInfo } from "../defines/IEntityInfo";
import { IFrameInfo } from "../defines/IFrameInfo";

export function make_entity_data(
  info: IEntityInfo,
  frames: Record<string, IFrameInfo>,
): IEntityData {
  const ret: IEntityData = {
    id: "",
    type: EntityEnum.Entity,
    base: info,
    frames: frames,
  };
  return ret;
}
