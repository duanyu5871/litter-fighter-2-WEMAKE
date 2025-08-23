import { ICollision } from "../base";
import { StateEnum } from "../defines";


export function handle_ball_is_hit(collision: ICollision): void {
  const { victim, attacker } = collision;
  victim.shaking = 0;
  victim.velocities.length = 1;
  victim.velocity_0.x = 0;
  victim.velocity_0.z = 0;
  victim.velocity_0.y = 0;
  switch (victim.frame.state) {
    case StateEnum.Ball_Flying:
    case StateEnum.Ball_Rebounding:
      victim.team = attacker.team;
      break;
  }
}
