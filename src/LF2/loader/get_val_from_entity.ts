import { CheatType, ItrKind } from "../defines";
import { EntityVal } from "../defines/EntityVal";
import { IValGetter, IValGetterGetter } from "../defines/IExpression";
import { Entity } from "../entity/Entity";
import { is_ball, is_character, is_weapon } from "../entity/type_check";
import { find } from "../utils/container_help";
import { between, clamp, round } from "../utils/math";
import { get_val_from_world } from "./get_val_from_world";

export const get_val_getter_from_entity: IValGetterGetter<Entity> = (
  word: string,
): IValGetter<Entity> | undefined => {
  switch (word) {
    case EntityVal.Holding:
      return e => (e.holding === void 0) ? 0 : 1
    case EntityVal.Shaking:
      return e => e.shaking;
    case EntityVal.FrameState:
      return e => e.frame.state;
    case EntityVal.TrendX:
      return (e) => {
        if (e.velocity_0.x < 0) return -e.facing;
        if (e.velocity_0.x > 0) return e.facing;
        return 0;
      };
    case EntityVal.PressFB:
      return (e) => {
        return e.ctrl ? e.ctrl.LR * e.facing : 0;
      };
    case EntityVal.PressLR:
      return (e) => {
        return e.ctrl ? e.ctrl.LR : 0;
      };
    case EntityVal.RequireSuperPunch:
      return (e) => {
        for (const [, { itr, attacker }] of e.v_rests) {
          if (itr.kind !== ItrKind.SuperPunchMe) continue;
          // 小于0时，眩晕者在攻击者左侧，否则在右侧
          const diff_x = e.position.x - attacker.position.x;
          if (
            (between(diff_x, -20, 20)) ||
            (diff_x < -20 && e.facing === 1) ||
            (diff_x > 20 && e.facing === -1)
          ) return 1;
        }
        return 0;
      };
    case EntityVal.PressUD:
      return (e) => {
        return e.ctrl ? e.ctrl.UD : 0;
      };
    case EntityVal.HP_P:
      return (e) => {
        return clamp(
          round((100 * e.hp) / e.hp_max), 0, 100);
      };
    case EntityVal.LF2_NET_ON:
      return (e) => {
        return e.lf2.is_cheat_enabled(CheatType.LF2_NET) ? 1 : 0;
      };
    case EntityVal.HERO_FT_ON:
      return (e) => {
        return e.lf2.is_cheat_enabled(CheatType.HERO_FT) ? 1 : 0;
      };
    case EntityVal.GIM_INK_ON:
      return (e) => {
        return e.lf2.is_cheat_enabled(CheatType.GIM_INK) ? 1 : 0;
      };
    case EntityVal.WeaponType:
      return (e) => {
        return e.holding?.data.base.type ?? 0;
      };
    case EntityVal.HAS_TRANSFORM_DATA:
      return (e) => {
        return e.transform_datas ? 1 : 0;
      };
    case EntityVal.Catching:
      return (e) => {
        return e.catching ? 1 : 0;
      };
    case EntityVal.CAUGHT:
      return (e) => {
        return e.catcher ? 1 : 0;
      };
    case EntityVal.HitByCharacter:
      return (e) => {
        return find(e.collided_list, (c) => is_character(c.attacker)) ? 1 : 0;
      };
    case EntityVal.HitByWeapon:
      return (e) => {
        return find(e.collided_list, (c) => is_weapon(c.attacker)) ? 1 : 0;
      };
    case EntityVal.HitByBall:
      return (e) => {
        return find(e.collided_list, (c) => is_ball(c.attacker)) ? 1 : 0;
      };
    case EntityVal.HitByItrKind:
      return (e) => {
        return e.collided_list.map((i) => i.itr.kind);
      };
    case EntityVal.HitByItrEffect:
      return (e) => {
        return e.collided_list
          .map((i) => i.itr.effect)
          .filter((v) => v !== void 0);
      };
    case EntityVal.HitByState:
      return (e) => {
        return e.collided_list.map((i) => i.aframe.state);
      };
    case EntityVal.HitOnCharacter:
      return (e) => {
        return find(e.collision_list, (c) => is_character(c.victim)) ? 1 : 0;
      };
    case EntityVal.HitOnWeapon:
      return (e) => {
        return find(e.collision_list, (c) => is_weapon(c.victim)) ? 1 : 0;
      };
    case EntityVal.HitOnBall:
      return (e) => {
        return find(e.collision_list, (c) => is_ball(c.victim)) ? 1 : 0;
      };
    case EntityVal.HitOnState:
      return (e) => {
        return e.collision_list.map((i) => i.bframe.state);
      };
    case EntityVal.HitOnSth:
      return (e) => {
        return e.collision_list.length;
      };
    case EntityVal.HP:
      return (e) => {
        return e.hp;
      };
    case EntityVal.MP:
      return (e) => {
        return e.mp;
      };
    case EntityVal.VX:
      return (e) => {
        return e.velocity.x;
      };
    case EntityVal.VY:
      return (e) => {
        return e.velocity.y;
      };
    case EntityVal.VZ:
      return (e) => {
        return e.velocity.z;
      };
    default:
      const fallback = get_val_from_world(word);
      return (e, ...arg) => fallback?.(e.world, ...arg);
  }
};


