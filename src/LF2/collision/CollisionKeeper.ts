import { ItrKind } from "../defines";
import { BdyKind } from "../defines/BdyKind";
import { ICollision } from "../defines/ICollision";
import { ICollisionHandler } from "../defines/ICollisionHandler";
import { handle_itr_kind_catch } from "./handle_itr_kind_catch";
import { handle_itr_kind_force_catch } from "./handle_itr_kind_force_catch";
import { handle_itr_kind_freeze } from "./handle_itr_kind_freeze";
import { handle_itr_kind_normal } from "./handle_itr_kind_normal";
import { handle_itr_kind_whirlwind } from "./handle_itr_kind_whirlwind";

export class CollisionKeeper {
  protected pair_map: Map<string, (collision: ICollision) => void> = new Map();
  add(itr_kind: ItrKind | ItrKind[], bdy_kind: BdyKind | BdyKind[], fn: (collision: ICollision) => void) {
    const itr_kind_list = Array.isArray(itr_kind) ? itr_kind : [itr_kind];
    const bdy_kind_list = Array.isArray(bdy_kind) ? bdy_kind : [bdy_kind];
    for (const itr_kind of itr_kind_list) {
      for (const bdy_kind of bdy_kind_list) {
        this.pair_map.set('' + itr_kind + '_' + bdy_kind, fn);
      }
    }
  }
  adds(...list: ICollisionHandler[]) {
    for (const i of list) {
      this.add(i.itr, i.bdy, i.run.bind(i))
    }
  }
  get(itr_kind: ItrKind, bdy_kind: BdyKind) {
    if (itr_kind === void 0) { console.warn('[CollisionHandler] itr.kind got', itr_kind); debugger; }
    if (bdy_kind === void 0) { console.warn('[CollisionHandler] bdy.kind got', bdy_kind); debugger; }
    return this.pair_map.get('' + itr_kind + '_' + bdy_kind);
  }

  handle(collision: ICollision) {
    this.get(collision.itr.kind!, collision.bdy.kind!)?.(collision);
  }

}
export const collisions_keeper = new CollisionKeeper();
collisions_keeper.add(
  [ItrKind.Catch],
  [BdyKind.Normal, BdyKind.Defend],
  handle_itr_kind_catch
)
collisions_keeper.add(
  [ItrKind.ForceCatch],
  [BdyKind.Normal, BdyKind.Defend],
  handle_itr_kind_force_catch
)
collisions_keeper.add(
  [ItrKind.Whirlwind],
  [BdyKind.Normal, BdyKind.Defend],
  handle_itr_kind_whirlwind
)
collisions_keeper.add(
  [ItrKind.Freeze],
  [BdyKind.Normal, BdyKind.Defend],
  handle_itr_kind_freeze
)
collisions_keeper.add(
  [ItrKind.JohnShield, ItrKind.Normal, ItrKind.WeaponSwing, ItrKind.CharacterThrew],
  [BdyKind.Normal],
  handle_itr_kind_normal
)