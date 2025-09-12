import { IOpointInfo, BuiltIn_OID } from "../defines";
import { Entity } from "../entity";

export function make_smoke(entity: Entity): IOpointInfo {
  return {
    kind: 0,
    x: entity.frame.centerx,
    y: entity.frame.centery / 2,
    oid: BuiltIn_OID.BrokenWeapon,
    action: { id: "140", facing: entity.lf2.random_get([-1, 1]) },
    dvx: entity.lf2.random_in(-3, 3),
    is_entity: false,
  };
}
