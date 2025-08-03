import { GameKey as GK } from "../defines";
import { StateEnum } from "../defines/StateEnum";
import { abs } from "../utils";
import { BotCtrlState } from "./BotCtrlState";
import { BotCtrlState_Base } from "./BotCtrlState_Base";

export class BotCtrlState_Chasing extends BotCtrlState_Base {
  readonly key = BotCtrlState.Chasing;
  override update() {
    const { ctrl } = this;
    ctrl.update_nearest();
    const en = ctrl.chasing_enemy
    if (!en) return BotCtrlState.Standing;

    const me = ctrl.entity;
    const { x: my_x, z: my_z } = ctrl.guess_entity_pos(me);
    const { x: en_x, z: en_z } = ctrl.guess_entity_pos(en);
    const { state } = me.frame;
    const x_diff = abs(my_x - en_x)
    const z_diff = abs(my_z - en_z)
    const x_reach = x_diff <= ctrl.W_ATK_ZONE_X;
    const z_reach = z_diff <= ctrl.W_ATK_ZONE_Z;

    if (state === StateEnum.Running) {
      // STOP RUNNING.
      if (my_x > en_x && me.facing > 0) {
        ctrl.key_down(GK.L).key_up(GK.R, GK.L)
        return
      } else if (my_x < en_x && me.facing < 0) {
        ctrl.key_down(GK.R).key_up(GK.R, GK.L)
        return
      } else if (
        abs(en_x - my_x) < ctrl.W_ATK_ZONE_X ||
        ctrl.desire() < ctrl.STOP_RUN_DESIRE
      ) {
        me.facing < 0 ?
          ctrl.key_down(GK.R).key_up(GK.R, GK.L) :
          ctrl.key_down(GK.L).key_up(GK.R, GK.L)
        return
      }
    } else if (
      state === StateEnum.Standing ||
      state === StateEnum.Walking
    ) {
      if (my_x < en_x - ctrl.RUN_ZONE_X && ctrl.desire() < ctrl.RUN_DESIRE) {
        ctrl.db_hit(GK.R).end(GK.R);
        return
      } else if (my_x > en_x + ctrl.RUN_ZONE_X && ctrl.desire() < ctrl.RUN_DESIRE) {
        ctrl.db_hit(GK.L).end(GK.L);
        return
      }
    }

    if (my_x < en_x - ctrl.W_ATK_ZONE_X) {
      ctrl.key_down(GK.R).key_up(GK.L);
    } else if (my_x > en_x + ctrl.W_ATK_ZONE_X) {
      ctrl.key_down(GK.L).key_up(GK.R);
    } else {
      ctrl.key_up(GK.L, GK.R);
    }

    if (my_z < en_z - ctrl.W_ATK_ZONE_Z) {
      ctrl.key_down(GK.D).key_up(GK.U);
    } else if (my_z > en_z + ctrl.W_ATK_ZONE_Z) {
      ctrl.key_down(GK.U).key_up(GK.D);
    } else {
      ctrl.key_up(GK.U, GK.D);
    }

    if (x_reach && z_reach) {
      /** 回头 */
      if (x_diff <= 5) {
        ctrl.key_up(GK.L, GK.R)
      } else if (my_x > en_x && ctrl.entity.facing > 0) {
        ctrl.key_down(GK.L).key_up(GK.R);
      } else if (my_x < en_x && ctrl.entity.facing < 0) {
        ctrl.key_down(GK.R).key_up(GK.L);
      }
      ctrl.key_down(GK.a).key_up(GK.a)
    } else {
      ctrl.key_up(GK.a)
    }

    switch (state) {
      case StateEnum.Standing:
      case StateEnum.Walking:
      case StateEnum.Running: {
        if (ctrl.desire() < ctrl.JUMP_DESIRE) {
          ctrl.key_down(GK.j).end(GK.j)
        }
        break;
      }
    }
  }
}
