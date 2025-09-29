import { KEY_NAME_LIST } from "../../controller";
import { BotStateEnum, Defines, GK } from "../../defines";
import { manhattan_xz } from "../../helper/manhattan_xz";
import { BotState_Base } from "./BotState";


export class BotState_Following extends BotState_Base {
  readonly key = BotStateEnum.Following;
  override enter(): void {
    this.ctrl.key_up(...KEY_NAME_LIST);
  }
  override update(dt: number) {
    super.update(dt);

    if (this.handle_defends()) return;
    this.random_jumping();

    const { ctrl: c } = this;
    const me = c.entity;

    if (c.following) {
      const [en_x, , en_z] = c.following
      const { x: my_x, z: my_z } = me.position;
      const offset_x = Defines.AI_FOLLOWING_RANGE_X
      const offset_z = Defines.AI_FOLLOWING_RANGE_Z

      if (my_x < en_x - offset_x) {
        c.db_hit(GK.R).end(GK.R);
      } else if (my_x > en_x + offset_x) {
        c.db_hit(GK.L).end(GK.L);
      } else {
        c.key_up(GK.L, GK.R);
      }
      if (my_z < en_z - offset_z) {
        c.key_down(GK.D).key_up(GK.U);
      } else if (my_z > en_z + offset_z) {
        c.key_down(GK.U).key_up(GK.D);
      } else {
        c.key_up(GK.U, GK.D);
      }
      return;
    }


    delete c.following;
    this.ctrl.key_up(...KEY_NAME_LIST);
    const en = c.get_chasing()?.entity;
    const av = c.get_avoiding()?.entity;

    if (en && av && manhattan_xz(me, av) < manhattan_xz(me, en))
      return BotStateEnum.Avoiding;
    else if (en)
      return BotStateEnum.Chasing;
    else if (av)
      return BotStateEnum.Avoiding;
    else
      return BotStateEnum.Idle;
  }
}
