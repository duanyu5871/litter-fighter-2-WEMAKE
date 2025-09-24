import { Defines, StateEnum } from "../defines";
import { Entity } from "../entity/Entity";
import { min } from "../utils";
import CharacterState_Base from "./CharacterState_Base";

export class CharacterState_Drink extends CharacterState_Base {
  constructor(state: StateEnum = StateEnum.Drink) {
    super(state)
  }
  override update(e: Entity): void {
    super.update(e);
    const holding = e.holding;
    const drink = e.holding?.drink
    if (!holding || !drink) return;

    const { hp_h_empty, hp_r_empty, mp_h_empty } = drink
    if (!hp_h_empty && drink.hp_h_ticks.add()) {
      e.hp = min(e.hp_max, e.hp + drink.hp_h_value)
      drink.hp_h += drink.hp_h_value
    }
    if (!hp_r_empty && drink.hp_r_ticks.add()) {
      e.hp_r = min(e.hp_max, e.hp_r + drink.hp_r_value)
      drink.hp_r += drink.hp_r_value
    }
    if (!mp_h_empty && drink.mp_h_ticks.add()) {
      e.mp = min(e.mp_max, e.mp + drink.mp_h_value)
      drink.mp_h += drink.mp_h_value
    }
    if (hp_h_empty && hp_r_empty && mp_h_empty) {

      holding.enter_frame({ id: holding.lf2.random_get(holding.data.indexes?.in_the_skys) });
      holding.hp = holding.hp_r = 1;
      holding.velocities.length = 1;
      holding.velocity_0.set(3 * e.facing, 4, 0);
      holding.holder = void 0;
      holding.follow_holder();

      e.holding = void 0;
      e.enter_frame(Defines.NEXT_FRAME_AUTO);
    }
  }
}
