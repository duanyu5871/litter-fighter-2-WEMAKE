import { ItrKind, Defines } from '../defines';
import { EntityVal } from '../defines/EntityVal';
import Entity from '../entity/Entity';
import { is_character, is_weapon, is_ball } from '../entity/type_check';
import { find } from '../utils/container_help';
import { clamp } from '../utils/math';

export function get_val_from_entity(word: string, e: Entity): any {
  switch (word) {
    case EntityVal.TrendX:
      if (e.velocities[0].x < 0) return -e.facing;
      if (e.velocities[0].x > 0) return e.facing;
      return 0;
    case EntityVal.PressFB:
      return e.controller ? e.controller.LR * e.facing : 0;
    case EntityVal.PressLR:
      return e.controller ? e.controller.LR : 0;
    case EntityVal.RequireSuperPunch:
      for (const [, { itr, attacker }] of e.v_rests) {
        if (itr.kind === ItrKind.SuperPunchMe && (
          (attacker.position.x > e.position.x && e.facing === 1 && e.controller?.LR !== -1) ||
          (attacker.position.x < e.position.x && e.facing === -1 && e.controller?.LR !== 1)
        )) {
          return 1;
        }
      }
      return 0;
    case EntityVal.PressUD:
      return e.controller ? e.controller.UD : 0;
    case EntityVal.HP_P:
      return clamp(Math.round(100 * e.hp / e.hp_max), 0, 100);
    case EntityVal.LF2_NET_ON:
      return e.lf2.is_cheat_enabled(Defines.Cheats.LF2_NET) ? 1 : 0;
    case EntityVal.HERO_FT_ON:
      return e.lf2.is_cheat_enabled(Defines.Cheats.HERO_FT) ? 1 : 0;
    case EntityVal.GIM_INK_ON:
      return e.lf2.is_cheat_enabled(Defines.Cheats.GIM_INK) ? 1 : 0;
    case EntityVal.WeaponType:
      return e.holding?.data.base.type ?? 0;
    case EntityVal.HAS_TRANSFROM_DATA:
      return e.transform_datas ? 1 : 0;
    case EntityVal.Catching:
      return e.catching ? 1 : 0;
    case EntityVal.CAUGHT:
      return e.catcher ? 1 : 0;
    case EntityVal.HitByCharacter:
      return find(e.collided_list, c => is_character(c.attacker)) ? 1 : 0;
    case EntityVal.HitByWeapon:
      return find(e.collided_list, c => is_weapon(c.attacker)) ? 1 : 0;
    case EntityVal.HitByBall:
      return find(e.collided_list, c => is_ball(c.attacker)) ? 1 : 0;
    case EntityVal.HitByItrKind:
      return e.collided_list.map(i => i.itr.kind);
    case EntityVal.HitByItrEffect:
      return e.collided_list.map(i => i.itr.effect).filter(v => v !== void 0);
    case EntityVal.HitByState:
      return e.collided_list.map(i => i.aframe.state);
    case EntityVal.HitOnCharacter:
      return find(e.collision_list, c => is_character(c.attacker)) ? 1 : 0;
    case EntityVal.HitOnWeapon:
      return find(e.collision_list, c => is_weapon(c.attacker)) ? 1 : 0;
    case EntityVal.HitOnBall:
      return find(e.collision_list, c => is_ball(c.attacker)) ? 1 : 0;
    case EntityVal.HitOnState:
      return e.collision_list.map(i => i.bframe.state);
    case EntityVal.HitOnSth:
      return e.collision_list.length;
    case EntityVal.HP:
      return e.hp;
    case EntityVal.MP:
      return e.mp;
    case EntityVal.VX:
      return e.velocity.x;
    case EntityVal.VY:
      return e.velocity.y;
    case EntityVal.VZ:
      return e.velocity.z;
  }

  return word;
}

