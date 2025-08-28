import { BuiltIn_OID, FrameBehavior, OpointKind } from "../defines";
import { IEntityData } from "../defines/IEntityData";
import { traversal } from "../utils/container_help/traversal";
import { AllyFlag } from "../defines/AllyFlag";
import { ensure, find, floor } from "../utils";

export function make_ball_special(data: IEntityData) {
  switch (data.id) {
    case BuiltIn_OID.FirenFlame:
      traversal(data.frames, (_, frame) => {
        if (frame.itr) for (const itr of frame.itr)
          itr.ally_flags = AllyFlag.Enemy;
      });
      break;
    case BuiltIn_OID.FirzenBall:
      traversal(data.frames, (_, frame) => {
        frame.ctrl_spd_z = 0;
        frame.no_shadow = 1;
      });
      break;
    case BuiltIn_OID.BatBall:
      traversal(data.frames, (_, frame) => {
        frame.ctrl_spd_z = 0;
        frame.no_shadow = 1;
      });
      break;
    case BuiltIn_OID.JanChase:
      data.frames['50'].invisible = data.frames['50'].wait;
      data.frames['51'].invisible = data.frames['51'].wait;
      data.frames['52'].invisible = data.frames['52'].wait;
      traversal(data.frames, (_, f) => {
        if (f.behavior === FrameBehavior.ChasingSameEnemy) {
          f.opoint = ensure(f.opoint, {
            oid: BuiltIn_OID.JanChase,
            action: { id: "40" },
            x: f.centerx,
            y: f.centery,
            kind: OpointKind.Normal,
            is_entity: false,
            speedz: 0,
            dvx: 0,
            dvy: 0,
            dvz: 0,
            interval: 1,
            interval_id: '1',
            interval_mode: 1
          })
        }
        const tail = find(f.opoint, o => o.oid === BuiltIn_OID.JanChase && (o.action as any).id === '40')
        if (tail) {
          tail.speedz = tail.dvx = tail.dvy = tail.dvz = 0;
          tail.is_entity = false
        }
      })
      break;
    case BuiltIn_OID.JanChaseh:
      data.frames['50'].invisible = data.frames['50'].wait;
      data.frames['51'].invisible = data.frames['51'].wait;
      data.frames['52'].invisible = data.frames['52'].wait;
      traversal(data.frames, (_, f) => {
        const tail = find(f.opoint, o => o.oid === BuiltIn_OID.JanChaseh && (o.action as any).id === '40')
        if (tail) {
          tail.speedz = tail.dvx = tail.dvy = tail.dvz = 0;
          tail.is_entity = false
        }
      })
      break;
    case BuiltIn_OID.FirzenChasef:
      data.frames['59'].invisible = data.frames['59'].wait;
      data.frames['80'].invisible = data.frames['80'].wait;
      data.frames['81'].invisible = data.frames['81'].wait;
      traversal(data.frames, (_, f) => {
        if (f.behavior === FrameBehavior.ChasingSameEnemy) {
          f.opoint = ensure(f.opoint, {
            oid: BuiltIn_OID.FirzenChasef,
            action: { id: "40" },
            x: floor(f.pic!.w / 2),
            y: floor(f.pic!.h / 2),
            kind: OpointKind.Normal,
            is_entity: false,
            speedz: 0,
            dvx: 0,
            dvy: 0,
            dvz: 0,
            interval: 1,
            interval_id: '1',
            interval_mode: 1
          })
        }
      })
      break;
    case BuiltIn_OID.FirzenChasei:
      traversal(data.frames, (_, f) => {
        if (f.behavior === FrameBehavior.ChasingSameEnemy) {
          f.opoint = ensure(f.opoint, {
            oid: BuiltIn_OID.FirzenChasei,
            action: { id: "40" },
            x: floor(f.pic!.w / 2),
            y: floor(f.pic!.h / 2),
            kind: OpointKind.Normal,
            is_entity: false,
            speedz: 0,
            dvx: 0,
            dvy: 0,
            dvz: 0,
            interval: 1,
            interval_id: '1',
            interval_mode: 1
          })
        }
      })
      break;
  }
}
