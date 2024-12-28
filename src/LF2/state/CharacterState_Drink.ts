import { Defines } from "../defines";
import Entity from "../entity/Entity";
import { is_weapon } from "../entity/type_check";
import CharacterState_Base from "./CharacterState_Base";

export class CharacterState_Drink extends CharacterState_Base {
  override update(e: Entity): void {
    super.update(e);
    // FIXME: 更通用的补充机制。而不是写死。 -Gim
    if (e.holding) {
      e.holding.mp -= 1;
      if (e.holding.data.id === "122") {
        const next_hp = e.hp + 2;
        if (next_hp < e.hp_max) {
          e.hp = next_hp;
        }
        const next_mp = e.mp + 0.25;
        if (next_mp < e.mp_max) {
          e.mp = next_mp;
        }
      } else if (e.holding.data.id === "123") {
        const next_mp = e.mp + 5;
        if (next_mp < e.mp_max) {
          e.mp = next_mp;
        }
      }
      if (e.holding.mp <= 0) {
        e.holding.hp = 1;

        if (is_weapon(e.holding)) {
          e.holding.enter_frame({ id: e.holding.data.indexes?.in_the_sky });
          e.holding.velocities.length = 1;
          e.holding.velocities[0].set(3 * e.facing, 4, 0);
          e.holding.holder = void 0;
          e.holding.follow_holder();
          e.holding = void 0;
        }
        e.enter_frame(Defines.NEXT_FRAME_AUTO);
      }
    }
  }
}
