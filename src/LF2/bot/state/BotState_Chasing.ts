import { KEY_NAME_LIST } from "../../controller/BaseController";
import { GK, ItrKind, StateEnum } from "../../defines";
import { manhattan_xz } from "../../helper/manhattan_xz";
import { abs, between, find } from "../../utils";
import { BotState_Base } from "./BotState";
import { BotStateEnum } from "../../defines/BotStateEnum";

export class BotState_Chasing extends BotState_Base {
  readonly key = BotStateEnum.Chasing;
  override update() {
    const { ctrl: c } = this;
    const me = c.entity;
    const en = c.get_chasing()
    const av = c.get_avoiding()
    if (av && en && manhattan_xz(me, av) < manhattan_xz(me, en))
      return BotStateEnum.Avoiding
    else if (!en && av) return BotStateEnum.Avoiding;
    else if (!en) return BotStateEnum.Idle;

    const { facing: a_facing } = me
    const { x: my_x, z: my_z, y: my_y } = me.position;
    const { next_x: en_x, next_z: en_z, next_y: en_y } = c.guess_entity_pos(en);
    const { state } = me.frame;

    const dist_av_x = a_facing * (en_x - my_x)
    const dist_av_y = en_y - my_y
    const dist_av_z = en_z - my_z

    /** 
     * 敌人与自己的距离X
     * 敌人在背后时为负数
     * 敌人在正面时为正数
     */
    const dist_en_x = a_facing * (en_x - my_x)
    /** 
     * 敌人与自己的距离y
     * 敌人在上方时为正数
     * 敌人在下面时为负数数
     */
    const dist_en_y = en_y - my_y

    /**
     * 敌人与自己的距离X
     */
    const abs_dx = abs(my_x - en_x)
    /**
     * 敌人与自己的距离Z
     */
    const abs_dz = abs(my_z - en_z)

    const x_reach = abs_dx <= c.w_atk_x;
    const z_reach = abs_dz <= c.w_atk_z;
    const z_reach_2 = abs_dz <= 2 * c.w_atk_z;
    const z_reach_3 = abs_dz <= 3 * c.w_atk_z;

    this.random_jumping();
    if (this.handle_bot_actions()) return;

    if (c.balls.targets.length > 0) {
      const dx = c.balls.targets[0].entity.position.x - me.position.x
      if (dx > 0 && a_facing < 0) {
        c.key_down(GK.R).key_up(GK.L)
      } else if (dx < 0 && a_facing > 0) {
        c.key_down(GK.L).key_up(GK.R)
      }
      c.start(GK.d).end(GK.d)
      return
    }

    switch (state) {
      case StateEnum.Normal:
        if (this.defend_test()) return;
        break;
      case StateEnum.Running: {
        if (this.defend_test()) return;
        if (find(me.v_rests, v => v[1].itr.kind === ItrKind.Block)) {
          c.start(GK.a).end(GK.a)
        }
        if (a_facing > 0 && abs_dx < c.w_atk_x) {
          // 避免跑过头停下
          c.key_down(GK.L).key_up(GK.R, GK.L)
        } else if (a_facing < 0 && abs_dx < c.w_atk_x) {
          // 避免跑过头停下
          c.key_down(GK.R).key_up(GK.R, GK.L)
        } else if (
          c.desire() < c.r_atk_desire &&
          between(dist_en_x, 0, c.r_atk_x) &&
          between(abs_dz, 0, c.r_atk_z)
        ) {
          // 概率跑攻
          c.key_down(GK.a).key_up(GK.a, GK.R, GK.L)
        } else if (c.desire() < c.r_stop_desire) {
          // 概率刹车
          a_facing < 0 ?
            c.key_down(GK.R).key_up(GK.R, GK.L) :
            c.key_down(GK.L).key_up(GK.R, GK.L)
        } else break;
        return
      }
      case StateEnum.Injured:
        c.start(GK.d).end(GK.d)
        break;
      case StateEnum.Catching:
        // shit, louisEx air-push frame's state is StateEnum.Catching...
        if (me.catching) c.start(GK.a).end(GK.a)
        break;
      case StateEnum.Attacking:
      case StateEnum.BurnRun:
      case StateEnum.Z_Moveable:
        if (my_z < en_z - c.w_atk_z) {
          c.key_down(GK.D);
        } else if (my_z > en_z + c.w_atk_z) {
          c.key_down(GK.U);
        } else {
          c.key_up(GK.D, GK.U);
        }
        break;
      case StateEnum.Standing:
      case StateEnum.Walking: {
        if (this.defend_test()) return;
        if (find(me.v_rests, v => v[1].itr.kind === ItrKind.Block)) {
          c.start(GK.a).end(GK.a)
        }
        const { r_desire } = c;
        if (r_desire > 0) {
          c.db_hit(GK.R).end(GK.R);
        } else if (r_desire < 0) {
          c.db_hit(GK.L).end(GK.L);
        } else {
          break;
        }
        return;
      }
      case StateEnum.Dash: {
        if (find(me.v_rests, v => v[1].itr.kind === ItrKind.Block)) {
          c.start(GK.a).end(GK.a)
        }
        if (
          between(dist_en_x, 0, c.d_atk_x) &&
          between(abs_dz, 0, c.d_atk_z)
        ) {
          c.key_down(GK.a).key_up(GK.a)
          return
        }
        break;
      }
      case StateEnum.Jump: {
        if (
          my_y > 10 &&
          between(dist_en_x, 0, c.j_atk_x) &&
          between(abs_dz, 0, c.j_atk_z) &&
          between(dist_en_y, c.j_atk_y_min, c.j_atk_y_max)
        ) {
          // 跳攻
          c.key_down(GK.a).key_up(GK.a)
        } else if (my_x < en_x && abs_dx > c.w_atk_x) {
          // 转向
          c.key_down(GK.R).key_up(GK.L);
        } else if (my_x > en_x && abs_dx > c.w_atk_x) {
          // 转向
          c.key_down(GK.L).key_up(GK.R);
        } else {
          c.key_up(GK.L, GK.R);
          break;
        }
        return
      }
      default:
        c.key_up(...KEY_NAME_LIST);

    }

    if (my_x < en_x - c.w_atk_x) {
      c.key_down(GK.R).key_up(GK.L);
    } else if (my_x > en_x + c.w_atk_x) {
      c.key_down(GK.L).key_up(GK.R);
    } else {
      c.key_up(GK.L, GK.R);
    }
    if (my_z < en_z - c.w_atk_z) {
      c.key_down(GK.D).key_up(GK.U);
    } else if (my_z > en_z + c.w_atk_z) {
      c.key_down(GK.U).key_up(GK.D);
    } else {
      c.key_up(GK.U, GK.D);
    }
    if (
      between(dist_en_x, 0, c.w_atk_x) &&
      between(abs_dz, 0, c.w_atk_z)
    ) {
      c.key_down(GK.a).key_up(GK.a)
      return
    }
    if (x_reach && z_reach) {
      /** 回头 */
      if (abs_dx <= 5) {
        c.key_up(GK.L, GK.R)
      } else if (my_x > en_x && me.facing > 0) {
        c.key_down(GK.L).key_up(GK.R);
      } else if (my_x < en_x && me.facing < 0) {
        c.key_down(GK.R).key_up(GK.L);
      }
      c.key_down(GK.a).key_up(GK.a)
    } else {
      c.key_up(GK.a)
    }

  }
}

