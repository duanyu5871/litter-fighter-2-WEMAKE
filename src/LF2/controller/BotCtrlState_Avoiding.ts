
import { BotCtrlState } from "./BotCtrlState";
import { BotCtrlState_Base } from "./BotCtrlState_Base";
import { random_jumping } from "./random_jumping";
import { manhattan_xz } from "../helper/manhattan_xz";
import { GameKey as GK, ItrKind, StateEnum } from "../defines";
import { find } from "../utils";
export class BotCtrlState_Avoiding extends BotCtrlState_Base {
  readonly key = BotCtrlState.Avoiding;
  override update() {

    const { ctrl: c } = this;
    c.update_nearest();
    const me = c.entity;
    const en = c.chasing
    const av = c.avoiding
    const { state } = me.frame;

    random_jumping(this.ctrl)

    if (av && en && manhattan_xz(me, av) > manhattan_xz(me, en))
      return BotCtrlState.Chasing
    else if (av) {
      this.ctrl.avoid_enemy();
    } else if (en) {
      return BotCtrlState.Chasing;
    } else {
      return BotCtrlState.Standing;
    }

    switch (state) {
      case StateEnum.Dash:
      case StateEnum.Jump:
      case StateEnum.Standing:
      case StateEnum.Walking:
      case StateEnum.Running: {
        if (find(me.v_rests, v => v[1].itr.kind === ItrKind.Block)) {
          c.start(GK.a).end(GK.a)
        }
        break;
      }
    }
  }
}
