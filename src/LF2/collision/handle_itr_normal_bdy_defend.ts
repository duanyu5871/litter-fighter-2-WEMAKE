import { ICollision } from "../base";
import { Defines, ItrEffect, SparkEnum } from "../defines";
import { take_injury } from "./handle_fall";
import { handle_itr_normal_bdy_normal } from "./handle_itr_normal_bdy_normal";


export function handle_itr_normal_bdy_defend(collision: ICollision) {
  const { itr, attacker, victim, a_cube, b_cube, bdy } = collision;
  const { bdefend = Defines.DEFAULT_BREAK_DEFEND_VALUE } = itr;
  if (
    // 默认仅允许抵御来自前方的伤害
    (ItrEffect.FireExplosion !== itr.effect &&
      ItrEffect.Explosion !== itr.effect &&
      attacker.facing === victim.facing) ||
    (bdefend >= Defines.DEFAULT_FORCE_BREAK_DEFEND_VALUE)) {
    handle_itr_normal_bdy_normal(collision);
    return;
  }
  attacker.motionless = itr.motionless ?? collision.victim.world.itr_motionless;
  victim.shaking = itr.shaking ?? collision.attacker.world.itr_shaking;
  victim.defend_value -= bdefend;
  take_injury(itr, victim, attacker, 0.1);
  const [x, y, z] = victim.spark_point(a_cube, b_cube);
  if (victim.defend_value <= 0) {
    // 破防
    victim.defend_value = 0;
    victim.world.spark(x, y, z, SparkEnum.BrokenDefend);
    const action = bdy.actions?.find(v => v.type === 'broken_defend');
    if (action) {
      const result = victim.get_next_frame(action.data);
      if (result) victim.next_frame = result.frame;
    }
  } else {
    if (itr.dvx) victim.velocity_0.x = (itr.dvx * attacker.facing) / 2;
    victim.world.spark(x, y, z, SparkEnum.DefendHit);
    const action = bdy.actions?.find(v => v.type === 'defend');
    if (action) {
      const result = victim.get_next_frame(action.data);
      if (result) victim.next_frame = result.frame;
    }
  }
}
