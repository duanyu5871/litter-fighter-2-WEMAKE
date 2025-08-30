import { GameKey as GK, ItrKind } from "../defines";
import { StateEnum } from "../defines/StateEnum";
import { manhattan_xz } from "../helper/manhattan_xz";
import { abs, between, find } from "../utils";
import { KEY_NAME_LIST } from "./BaseController";
import { BotCtrlState } from "./BotCtrlState";
import { BotCtrlState_Base } from "./BotCtrlState_Base";
import { random_jumping } from "./random_jumping";

export class BotCtrlState_Chasing extends BotCtrlState_Base {
  readonly key = BotCtrlState.Chasing;
  override update() {
    const { ctrl: c } = this;
    c.update_nearest();
    const me = c.entity;
    const en = c.chasing
    const av = c.avoiding
    if (av && en && manhattan_xz(me, av) < manhattan_xz(me, en))
      return BotCtrlState.Avoiding
    else if (!en && av) return BotCtrlState.Avoiding;
    else if (!en) return BotCtrlState.Standing;

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

    random_jumping(c);
    const { ai } = me.data.base

    if (ai) {
      let action_ids = ai.frames?.[me.frame.id]
      if (action_ids) for (const aid of action_ids) {
        const result = this.ctrl.handle_action(ai.actions[aid])
        if (result) return;
      }

      action_ids = ai.states?.[me.frame.state]
      if (action_ids) for (const aid of action_ids) {
        const result = this.ctrl.handle_action(ai.actions[aid])
        if (result) return;
      }
    }

    switch (state) {
      case StateEnum.Running: {
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
        c.start(GK.a).end(GK.a)
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
        // const hits = me.frame.hit
        // if (hits) {
        //   const { sequences: seqs } = hits
        //   if (hits.a && dist_en_x > 100 && c.desire() < 3000) {
        //     c.start(GK.a).end(GK.a) // 持续a
        //   } else if (hits.j && dist_en_x < 0) {
        //     c.start(GK.j).end(GK.j) // 取消一些动作
        //   } else if (hits.d && dist_en_x < 0) {
        //     c.start(GK.d).end(GK.d) // 取消一些动作
        //   } else if (seqs && z_reach_2 && c.desire() < 2000) {
        //     const keys = c.lf2.random_get(Object.keys(seqs).filter(v => v[0] !== 'L' && v[0] !== 'R'))?.split('') as GK[]
        //     if (keys?.length) c.start(GK.d, ...keys).end(GK.d, ...keys)
        //   }
        // }

        break;
      case StateEnum.Standing:
      case StateEnum.Walking: {
        if (find(me.v_rests, v => v[1].itr.kind === ItrKind.Block)) {
          c.start(GK.a).end(GK.a)
        }
        // const seqs = me.frame.hit?.sequences;
        // if (seqs && c.desire() < 2000) {
        //   if (is_ai_ray_hit(me, en, { x: 1, z: 0, min_x: 100 })) {
        //     const kk: GK[] = []
        //     if (seqs.La && seqs.Ra) kk.push(GK.a)
        //     if (seqs.Lj && seqs.Rj) kk.push(GK.j)
        //     if (kk.length) {
        //       const lr = a_facing > 0 ? GK.R : GK.L
        //       const k = c.lf2.random_get(kk)!
        //       c.start(GK.d, lr, k).end(GK.d, lr, k)
        //     }
        //   } else if (z_reach_3) {
        //     const keys = c.lf2.random_get(Object.keys(seqs).filter(v => v[0] !== 'L' && v[0] !== 'R'))?.split('') as GK[]
        //     if (keys?.length) c.start(GK.d, ...keys).end(GK.d, ...keys)
        //   }
        //   return;
        // }
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

