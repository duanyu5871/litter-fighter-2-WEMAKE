import { Defines, StateEnum } from "../defines";
import { ICollision } from "../base/ICollision";

export function handle_itr_kind_freeze(c: ICollision) {
  const { itr, victim, attacker } = c;
  victim.play_sound(["data/065.wav.mp3"]);
  victim.fall_value -= itr.fall ? itr.fall : Defines.DEFAULT_ITR_FALL;
  const is_fall =
    victim.fall_value <= 0 ||
    (victim.fall_value <= Defines.DEFAULT_FALL_VALUE_DIZZY &&
      (StateEnum.Caught === victim.frame.state ||
        victim.velocities[0].y > 0 ||
        victim.position.y > 0));
  if (is_fall && itr.dvy)
    victim.velocities[0].y =
      (itr.dvy ?? attacker.world.ivy_d) * attacker.world.ivy_f;
  if (itr.dvz) victim.velocities[0].z = itr.dvz * attacker.world.ivz_f;
  victim.velocities[0].x =
    (itr.dvx ?? attacker.world.ivx_d) * attacker.facing * attacker.world.ivx_f;
  victim.next_frame = { id: victim.data.indexes?.ice };
}
