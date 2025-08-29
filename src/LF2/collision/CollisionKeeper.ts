import { ICollision, ICollisionHandler } from "../base";
import { ALL_ENTITY_ENUM, BdyKind, EntityEnum, ItrKind, TEntityEnum } from "../defines";
import Ditto from "../ditto";
import { bdy_action_handlers } from "../entity/bdy_action_handlers";
import { itr_action_handlers } from "../entity/itr_action_handlers";
import { arithmetic_progression } from "../utils";
import { handle_ball_hit_other } from "./handle_ball_hit_other";
import { handle_ball_is_hit } from "./handle_ball_is_hit";
import { handle_body_goto } from "./handle_body_goto";
import { handle_healing } from "./handle_healing";
import { handle_itr_kind_catch } from "./handle_itr_kind_catch";
import { handle_itr_kind_force_catch } from "./handle_itr_kind_force_catch";
import { handle_itr_kind_freeze } from "./handle_itr_kind_freeze";
import { handle_itr_kind_magic_flute } from "./handle_itr_kind_magic_flute";
import { handle_itr_kind_whirlwind } from "./handle_itr_kind_whirlwind";
import { handle_itr_normal_bdy_defend } from "./handle_itr_normal_bdy_defend";
import { handle_itr_normal_bdy_normal } from "./handle_itr_normal_bdy_normal";
import { handle_john_shield_hit_other_ball } from "./handle_john_shield_hit_other_ball";
import { handle_rest } from "./handle_rest";
import { handle_super_punch_me } from "./handle_super_punch_me";
import { handle_weapon_hit_other } from "./handle_weapon_hit_other";
import { handle_weapon_is_hit } from "./handle_weapon_is_hit";
import { handle_weapon_is_picked } from "./handle_weapon_is_picked";
import { handle_weapon_is_picked_secretly } from "./handle_weapon_is_picked_secretly";

export class CollisionKeeper {
  protected pair_map: Map<string, ((collision: ICollision) => void)[]> = new Map();
  add(
    a_type_list: TEntityEnum[],
    itr_kind_list: ItrKind[],
    v_type_list: TEntityEnum[],
    bdy_kind_list: BdyKind[],
    fn: (collision: ICollision) => void,
  ) {
    for (const itr_kind of itr_kind_list) {
      for (const a_type of a_type_list) {
        for (const bdy_kind of bdy_kind_list) {
          for (const v_type of v_type_list) {
            const key = [a_type, itr_kind, v_type, bdy_kind].join("_")
            const fns = this.pair_map.get(key) || []
            fns.push(fn)
            this.pair_map.set(key, fns);
          }
        }
      }
    }
  }
  adds(...list: ICollisionHandler[]) {
    for (const i of list) {
      this.add(i.a_type, i.itr, i.v_type, i.bdy, i.run.bind(i));
    }
  }
  get(
    a_type: TEntityEnum,
    itr_kind: ItrKind,
    v_type: TEntityEnum,
    bdy_kind: BdyKind,
  ) {
    if (itr_kind === void 0) {
      console.warn("[CollisionHandler] itr.kind got", itr_kind);
      debugger;
    }
    if (bdy_kind === void 0) {
      console.warn("[CollisionHandler] bdy.kind got", bdy_kind);
      debugger;
    }
    return this.pair_map.get(`${a_type}_${itr_kind}_${v_type}_${bdy_kind}`);
  }

  handle(collision: ICollision) {
    const handlers = this.get(
      collision.attacker.data.type,
      collision.itr.kind,
      collision.victim.data.type,
      collision.bdy.kind,
    )


    const collision_desc =
      `[${collision.attacker.data.type}]#${ItrKind[collision.itr.kind]} => ` +
      `[${collision.victim.data.type}]#${BdyKind[collision.bdy.kind]}`;

    Ditto.Debug(` collision: ${collision_desc} \nhandlers: ${handlers?.map(v => v.name) ?? 'none'}`)

    if (handlers) handlers.forEach(fn => fn(collision))

    const { itr, bdy, victim, attacker } = collision;
    victim.collided_list.push((victim.lastest_collided = collision));
    attacker.collision_list.push((attacker.lastest_collision = collision));
    if (itr.actions?.length) {
      for (const action of itr.actions) {
        if (action.tester?.run(collision) === false)
          continue;
        itr_action_handlers[action.type](action, collision)
      }
    }
    if (bdy.actions?.length) {
      for (const action of bdy.actions) {
        if (action.tester && !action.tester?.run(collision))
          continue;
        bdy_action_handlers[action.type](action, collision)
      }
    }
    if (
      itr.kind !== ItrKind.Block &&
      itr.kind !== ItrKind.Whirlwind &&
      itr.kind !== ItrKind.MagicFlute &&
      itr.kind !== ItrKind.MagicFlute2
    ) {
      const sounds = victim.data.base.hit_sounds;
      victim.play_sound(sounds);
    }
  }
}
export const collisions_keeper = new CollisionKeeper();
collisions_keeper.add(
  ALL_ENTITY_ENUM,
  [ItrKind.Catch],
  [EntityEnum.Character],
  [BdyKind.Normal, BdyKind.Defend],
  handle_itr_kind_catch,
);
collisions_keeper.add(
  ALL_ENTITY_ENUM,
  [ItrKind.ForceCatch],
  [EntityEnum.Character],
  [BdyKind.Normal, BdyKind.Defend],
  handle_itr_kind_force_catch,
);
collisions_keeper.add(
  ALL_ENTITY_ENUM,
  [ItrKind.Whirlwind],
  [EntityEnum.Character, EntityEnum.Weapon],
  [BdyKind.Normal, BdyKind.Defend],
  handle_itr_kind_whirlwind,
);
collisions_keeper.add(
  ALL_ENTITY_ENUM,
  [ItrKind.Freeze],
  [EntityEnum.Character],
  [BdyKind.Normal, BdyKind.Defend],
  handle_itr_kind_freeze,
);
collisions_keeper.add(
  ALL_ENTITY_ENUM,
  [
    ItrKind.JohnShield,
    ItrKind.Normal,
    ItrKind.WeaponSwing,
    ItrKind.CharacterThrew,
  ],
  [EntityEnum.Character],
  [BdyKind.Normal],
  handle_itr_normal_bdy_normal,
);
collisions_keeper.add(
  ALL_ENTITY_ENUM,
  [
    ItrKind.JohnShield,
    ItrKind.Normal,
    ItrKind.WeaponSwing,
    ItrKind.CharacterThrew,
  ],
  [EntityEnum.Character],
  [BdyKind.Defend],
  handle_itr_normal_bdy_defend,
);
collisions_keeper.add(
  [EntityEnum.Character],
  [ItrKind.MagicFlute, ItrKind.MagicFlute2],
  [EntityEnum.Character, EntityEnum.Weapon],
  [BdyKind.Normal, BdyKind.Defend],
  handle_itr_kind_magic_flute,
);
collisions_keeper.add(
  [EntityEnum.Character],
  [ItrKind.Pick],
  [EntityEnum.Weapon],
  [BdyKind.Normal],
  handle_weapon_is_picked,
);
collisions_keeper.add(
  [EntityEnum.Character],
  [ItrKind.PickSecretly],
  [EntityEnum.Weapon],
  [BdyKind.Normal],
  handle_weapon_is_picked_secretly,
);

collisions_keeper.add(
  ALL_ENTITY_ENUM,
  [
    ItrKind.JohnShield,
    ItrKind.Normal,
    ItrKind.WeaponSwing,
    ItrKind.CharacterThrew,
  ],
  [EntityEnum.Weapon],
  [BdyKind.Normal],
  handle_weapon_is_hit,
);

collisions_keeper.add(
  ALL_ENTITY_ENUM,
  [ItrKind.Block],
  [EntityEnum.Character],
  [BdyKind.Normal],
  handle_rest,
);

collisions_keeper.add(
  [EntityEnum.Ball],
  [ItrKind.Normal],
  ALL_ENTITY_ENUM,
  [BdyKind.Normal],
  handle_ball_hit_other
)

collisions_keeper.add(
  ALL_ENTITY_ENUM,
  [ItrKind.Normal, ItrKind.WeaponSwing, ItrKind.CharacterThrew],
  [EntityEnum.Ball],
  [BdyKind.Normal],
  handle_ball_is_hit
)
collisions_keeper.add(
  ALL_ENTITY_ENUM,
  [ItrKind.JohnShield],
  [EntityEnum.Ball],
  [BdyKind.Normal],
  handle_john_shield_hit_other_ball,
)

collisions_keeper.add(
  [EntityEnum.Weapon],
  [ItrKind.Normal],
  ALL_ENTITY_ENUM,
  [BdyKind.Normal],
  handle_weapon_hit_other
)


collisions_keeper.add(
  [EntityEnum.Character],
  [ItrKind.Normal],
  ALL_ENTITY_ENUM,
  arithmetic_progression(BdyKind.GotoMin, BdyKind.GotoMax, 1) as BdyKind[],
  handle_body_goto,
);

collisions_keeper.add(
  ALL_ENTITY_ENUM,
  [ItrKind.Heal],
  [EntityEnum.Character],
  [BdyKind.Normal],
  handle_healing,
);


collisions_keeper.add(
  [EntityEnum.Character],
  [ItrKind.SuperPunchMe],
  [EntityEnum.Character],
  [BdyKind.Normal],
  handle_super_punch_me,
);

