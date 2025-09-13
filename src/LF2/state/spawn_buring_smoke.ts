import { IOpointInfo, BuiltIn_OID } from "../defines";
import { Entity } from "../entity";
import { floor } from "../utils";


export function spawn_buring_smoke(entity: Entity, foo: 1 | 2): IOpointInfo {
  const { frame } = entity;
  const w = frame.pic?.w || 0;
  const h = frame.pic?.h || 0;
  const ret: IOpointInfo = {
    kind: 0,
    x: frame.centerx,
    y: frame.centery,
    oid: BuiltIn_OID.BrokenWeapon,
    action: { id: "140", facing: entity.lf2.random_get([-1, 1]) },
    // dvx: entity.lf2.random_in(-2, 2),
    speedz: 0,
    is_entity: false,
  };
  switch (foo) {
    case 1: {
      const xx = floor(entity.lf2.random_in(floor(w / 4), floor(3 * w / 4)));
      const yy = floor(entity.lf2.random_in(-floor(h / 2), 0));
      ret.x = xx;
      ret.y += yy;
      break;
    }
    case 2: {
      const xx = floor(entity.lf2.random_in(-floor(w / 6), floor(w / 6)));
      const yy = floor(entity.lf2.random_in(-floor(3 * h / 4), 0));
      ret.x += xx;
      ret.y += yy;
      break;
    }
  }


  return ret;
}
