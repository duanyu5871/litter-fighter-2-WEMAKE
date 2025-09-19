import { BuiltIn_OID, EntityGroup, FrameBehavior, OpointKind } from "../defines";
import { IEntityData } from "../defines/IEntityData";
import { traversal } from "../utils/container_help/traversal";
import { HitFlag } from "../defines/HitFlag";
import { ensure, find, floor } from "../utils";

export function make_ball_special(data: IEntityData) {
  switch (data.id as BuiltIn_OID) {
    case BuiltIn_OID.FirenFlame:
      traversal(data.frames, (_, frame) => {
        if (frame.itr) for (const itr of frame.itr)
          itr.hit_flag = HitFlag.Enemy;
      });
      break;
    case BuiltIn_OID.FirzenBall:
      traversal(data.frames, (_, frame) => {
        frame.no_shadow = 1;
      });
      break;
    case BuiltIn_OID.BatBall:
      traversal(data.frames, (_, frame) => {
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
    case BuiltIn_OID.DeepBall:
    case BuiltIn_OID.DennisBall:
    case BuiltIn_OID.WoodyBall:
    case BuiltIn_OID.DavisBall:
    case BuiltIn_OID.DennisChase:
    case BuiltIn_OID.JackBall:
    case BuiltIn_OID.JohnBall: {
      data.base.group = ensure(data.base.group, EntityGroup.FreezableBall)
      break;
    }
    case BuiltIn_OID.Template:
    case BuiltIn_OID.Julian:
    case BuiltIn_OID.Firzen:
    case BuiltIn_OID.LouisEX:
    case BuiltIn_OID.Bat:
    case BuiltIn_OID.Justin:
    case BuiltIn_OID.Knight:
    case BuiltIn_OID.Jan:
    case BuiltIn_OID.Monk:
    case BuiltIn_OID.Sorcerer:
    case BuiltIn_OID.Jack:
    case BuiltIn_OID.Mark:
    case BuiltIn_OID.Hunter:
    case BuiltIn_OID.Bandit:
    case BuiltIn_OID.Deep:
    case BuiltIn_OID.John:
    case BuiltIn_OID.Henry:
    case BuiltIn_OID.Rudolf:
    case BuiltIn_OID.Louis:
    case BuiltIn_OID.Firen:
    case BuiltIn_OID.Freeze:
    case BuiltIn_OID.Dennis:
    case BuiltIn_OID.Woody:
    case BuiltIn_OID.Davis:
    case BuiltIn_OID.Weapon0:
    case BuiltIn_OID.Weapon2:
    case BuiltIn_OID.Weapon4:
    case BuiltIn_OID.Weapon5:
    case BuiltIn_OID.Weapon6:
    case BuiltIn_OID.Weapon1:
    case BuiltIn_OID.Weapon3:
    case BuiltIn_OID.Weapon8:
    case BuiltIn_OID.Weapon9:
    case BuiltIn_OID.Weapon10:
    case BuiltIn_OID.Weapon11:
    case BuiltIn_OID.Criminal:
    case BuiltIn_OID.HenryArrow1:
    case BuiltIn_OID.RudolfWeapon:
    case BuiltIn_OID.HenryWind:
    case BuiltIn_OID.HenryArrow2:
    case BuiltIn_OID.FreezeBall:
    case BuiltIn_OID.FirenBall:
    case BuiltIn_OID.FreezeColumn:
    case BuiltIn_OID.Weapon7:
    case BuiltIn_OID.JohnBiscuit:
    case BuiltIn_OID.BatChase:
    case BuiltIn_OID.JustinBall:
    case BuiltIn_OID.JulianBall:
    case BuiltIn_OID.JulianBall2:
    case BuiltIn_OID.Etc:
    case BuiltIn_OID.BrokenWeapon:
  }
}
