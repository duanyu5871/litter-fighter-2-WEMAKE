import Expression from '../base/Expression';
import { INextFrame } from "../defines";
import { Defines } from '../defines/defines';
import Entity from '../entity/Entity';
import { is_ball, is_character, is_weapon } from "../entity/type_check";
import { find } from '../utils/container_help';
import { clamp } from '../utils/math';

export function cook_next_frame(i: INextFrame | INextFrame[]): void {
  if (Array.isArray(i)) {
    for (const v of i) cook_next_frame(v);
    return;
  }
  if (typeof i.expression !== 'string') return;
  i.judger = new Expression(i.expression, get_val_from_entity);
}

function get_val_from_entity(word: string, e: Entity): any {
  switch (word) {
    case Defines.ValWord.TrendX:
      if (e.velocities[0].x < 0) return -e.facing;
      if (e.velocities[0].x > 0) return e.facing;
      return 0
    case Defines.ValWord.PressFB:
      return e.controller ? e.controller.LR * e.facing : 0;
    case Defines.ValWord.PressLR:
      return e.controller ? e.controller.LR : 0;
    case Defines.ValWord.RequireSuperPunch:
      for (const [, { itr, attacker }] of e.v_rests) {
        if (
          itr.kind === Defines.ItrKind.SuperPunchMe && (
            (attacker.position.x > e.position.x && e.facing === 1 && e.controller?.LR !== -1) ||
            (attacker.position.x < e.position.x && e.facing === -1 && e.controller?.LR !== 1)
          )
        ) {
          return 1
        }
      }
      return 0
    case Defines.ValWord.PressUD:
      return e.controller ? e.controller.UD : 0;
    case Defines.ValWord.HP_P:
      return clamp(Math.round(100 * e.hp / e.max_hp), 0, 100);
    case Defines.ValWord.LF2_NET_ON:
      return e.lf2.is_cheat_enabled(Defines.Cheats.LF2_NET) ? 1 : 0;
    case Defines.ValWord.HERO_FT_ON:
      return e.lf2.is_cheat_enabled(Defines.Cheats.HERO_FT) ? 1 : 0;
    case Defines.ValWord.GIM_INK_ON:
      return e.lf2.is_cheat_enabled(Defines.Cheats.GIM_INK) ? 1 : 0;
    case Defines.ValWord.WeaponType:
      return e.holding?.data.base.type ?? 0;
    case Defines.ValWord.HAS_TRANSFROM_DATA:
      return e.transform_datas ? 1 : 0;
    case Defines.ValWord.Catching:
      return e.catching ? 1 : 0;
    case Defines.ValWord.CAUGHT:
      return e.catcher ? 1 : 0;
    case Defines.ValWord.HitByCharacter:
      return find(e.collided_list, c => is_character(c.attacker)) ? 1 : 0;
    case Defines.ValWord.HitByWeapon:
      return find(e.collided_list, c => is_weapon(c.attacker)) ? 1 : 0;
    case Defines.ValWord.HitByBall:
      return find(e.collided_list, c => is_ball(c.attacker)) ? 1 : 0;
    case Defines.ValWord.HitByItrKind:
      return e.collided_list.map(i => i.itr.kind);
    case Defines.ValWord.HitByItrEffect:
      return e.collided_list.map(i => i.itr.effect).filter(v => v !== void 0);
    case Defines.ValWord.HitByState:
      return e.collided_list.map(i => i.aframe.state);
    case Defines.ValWord.HitOnCharacter:
      return find(e.collision_list, c => is_character(c.attacker)) ? 1 : 0;
    case Defines.ValWord.HitOnWeapon:
      return find(e.collision_list, c => is_weapon(c.attacker)) ? 1 : 0;
    case Defines.ValWord.HitOnBall:
      return find(e.collision_list, c => is_ball(c.attacker)) ? 1 : 0;
    case Defines.ValWord.HitOnState:
      return e.collision_list.map(i => i.bframe.state);
    case Defines.ValWord.HitOnSth:
      return e.collision_list.length;
    case Defines.ValWord.HP:
      return e.hp;
    case Defines.ValWord.MP:
      return e.mp;
    case Defines.ValWord.VX:
      return e.velocity.x;
    case Defines.ValWord.VY:
      return e.velocity.y;
    case Defines.ValWord.VZ:
      return e.velocity.z;
  }

  return word
}


