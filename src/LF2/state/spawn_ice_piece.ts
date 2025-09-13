import { IOpointInfo, BuiltIn_OID } from "../defines";
import type { Entity } from "../entity";
import { floor } from "../utils";

export function spawn_ice_piece(entity: Entity, id: string): IOpointInfo {
  const { frame } = entity;
  const w = frame.pic?.w || 0;
  const h = frame.pic?.h || 0;

  const ret: IOpointInfo = {
    kind: 0,
    x: entity.frame.centerx,
    y: entity.frame.centery / 2,
    oid: BuiltIn_OID.BrokenWeapon,
    action: { id, facing: entity.lf2.random_get([-1, 1]) },
    dvx: entity.lf2.random_in(-4, 4),
    dvz: entity.lf2.random_in(-4, 4),
    dvy: entity.lf2.random_in(0, 5),
    is_entity: false,
    speedz: 0,
  };
  const xx = floor(entity.lf2.random_in(-floor(w / 4), floor(w / 4)));
  const yy = floor(entity.lf2.random_in(-floor(h / 2), 0));
  ret.x += xx;
  ret.y += yy;
  return ret;
}
