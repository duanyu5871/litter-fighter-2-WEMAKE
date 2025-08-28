import { GameKey as GK } from "../defines";
import { is_ai_ray_hit } from "../defines/is_ai_ray_hit";
import { StateEnum } from "../defines/StateEnum";
import { abs, between } from "../utils";
import { KEY_NAME_LIST } from "./BaseController";
import { BotCtrlState } from "./BotCtrlState";
import { BotCtrlState_Base } from "./BotCtrlState_Base";
import { random_jumping } from "./random_jumping";
import { xz_distance } from "./xz_distance";

export class BotCtrlState_Chasing extends BotCtrlState_Base {
  readonly key = BotCtrlState.Chasing;
  override update() {
    const { ctrl: c } = this;
    c.update_nearest();
    const me = c.entity;
    const en = c.chasing
    const av = c.avoiding
    if (av && en && xz_distance(me, av) < xz_distance(me, en))
      return BotCtrlState.Avoiding
    else if (!en && av) return BotCtrlState.Avoiding;
    else if (!en) return BotCtrlState.Standing;


    const { facing: a_facing } = me
    const { x: my_x, z: my_z, y: my_y } = me.position;
    const { next_x: en_x, next_z: en_z, next_y: en_y } = c.guess_entity_pos(en);
    const { state } = me.frame;
    /** 
     * 敌人与自己的距离X
     * 敌人在背后时为负数
     * 敌人在正面时为正数
     */
    const dist_x = a_facing * (en_x - my_x)
    /** 
     * 敌人与自己的距离y
     * 敌人在上方时为正数
     * 敌人在下面时为负数数
     */
    const dist_y = en_y - my_y

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

    random_jumping(c);


    switch (state) {
      case StateEnum.Running: {
        if (a_facing > 0 && abs_dx < c.w_atk_x) {
          // 避免跑过头停下
          c.key_down(GK.L).key_up(GK.R, GK.L)
        } else if (a_facing < 0 && abs_dx < c.w_atk_x) {
          // 避免跑过头停下
          c.key_down(GK.R).key_up(GK.R, GK.L)
        } else if (
          c.desire() < c.r_atk_desire &&
          between(dist_x, 0, c.r_atk_x) &&
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
      // case StateEnum.Defend:
      //   if (is_ai_ray_hit(me, en, { x: 1, z: 0 })) {
      //     const lr = a_facing > 0 ? GK.R : GK.L
      //     c.start(GK.d, lr, GK.a)
      //     return
      //   }
      //   break;
      case StateEnum.Standing:
      case StateEnum.Walking: {
        if ((
          is_ai_ray_hit(me, en, { x: 1, z: 0 }) ||
          is_ai_ray_hit(me, en, { x: 1, z: 0.3 })
        ) && c.desire() < 500) {
          const lr = a_facing > 0 ? GK.R : GK.L
          c.start(GK.d, lr, GK.a).end(GK.d, lr, GK.a)
        } else if (is_ai_ray_hit(me, en, { x: 1, z: 0 }) && c.desire() < 500) {
          const lr = a_facing > 0 ? GK.R : GK.L
          c.start(GK.d, lr, GK.j).end(GK.d, lr, GK.j)
        } else if (c.desire() < 100) {
          c.start(GK.d, GK.U, GK.j).end(GK.d, GK.U, GK.j)
        } else if (c.desire() < 100) {
          c.start(GK.d, GK.U, GK.a).end(GK.d, GK.U, GK.a)
        } else if (c.desire() < 100) {
          c.start(GK.d, GK.D, GK.j).end(GK.d, GK.D, GK.j)
        } else if (c.desire() < 100) {
          c.start(GK.d, GK.D, GK.a).end(GK.d, GK.D, GK.a)
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
        if (
          between(dist_x, 0, c.d_atk_x) &&
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
          between(dist_x, 0, c.j_atk_x) &&
          between(abs_dz, 0, c.j_atk_z) &&
          between(dist_y, c.j_atk_y_min, c.j_atk_y_max)
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
      between(dist_x, 0, c.w_atk_x) &&
      between(abs_dz, 0, c.w_atk_z)
    ) {
      c.key_down(GK.a).key_up(GK.a)
      return
    }
    if (x_reach && z_reach) {
      /** 回头 */
      if (abs_dx <= 5) {
        c.key_up(GK.L, GK.R)
      } else if (my_x > en_x && c.entity.facing > 0) {
        c.key_down(GK.L).key_up(GK.R);
      } else if (my_x < en_x && c.entity.facing < 0) {
        c.key_down(GK.R).key_up(GK.L);
      }
      c.key_down(GK.a).key_up(GK.a)
    } else {
      c.key_up(GK.a)
    }

  }
}

