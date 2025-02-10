import { ICollision, ICollisionHandler } from "../base";
import { ALL_ENTITY_ENUM, BdyKind, EntityEnum, ItrKind, TEntityEnum } from "../defines";
import { handle_itr_kind_catch } from "./handle_itr_kind_catch";
import { handle_itr_kind_force_catch } from "./handle_itr_kind_force_catch";
import { handle_itr_kind_freeze } from "./handle_itr_kind_freeze";
import { handle_itr_kind_magic_flute } from "./handle_itr_kind_magic_flute";
import { handle_itr_kind_normal } from "./handle_itr_kind_normal";
import { handle_itr_kind_whirlwind } from "./handle_itr_kind_whirlwind";

export class CollisionKeeper {
  protected pair_map: Map<string, (collision: ICollision) => void> = new Map();
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
            this.pair_map.set(
              [a_type, itr_kind, v_type, bdy_kind].join("_"),
              fn,
            );
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

  handle(c: ICollision) {
    this.get(
      c.attacker.data.type,
      c.itr.kind!,
      c.victim.data.type,
      c.bdy.kind,
    )?.(c);
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
  handle_itr_kind_normal,
);
collisions_keeper.add(
  [EntityEnum.Character],
  [ItrKind.MagicFlute, ItrKind.MagicFlute2],
  [EntityEnum.Character, EntityEnum.Weapon],
  [BdyKind.Normal, BdyKind.Defend],
  handle_itr_kind_magic_flute,
);
