import { ICollision } from "../base";
import { FrameBehavior, ItrKind, StateEnum } from "../defines";
import { is_character, is_weapon } from "../entity";

export function handle_ball_hit_other(collision: ICollision): void {
  const { attacker, victim, aframe } = collision;
  switch (aframe.behavior as FrameBehavior) {
    case FrameBehavior.JohnChase:
      attacker.hp = attacker.hp_r = 0;
      break;
    case FrameBehavior.DennisChase:
    case FrameBehavior._03:
    case FrameBehavior._04:
    case FrameBehavior._05:
    case FrameBehavior._06:
    case FrameBehavior.ChasingSameEnemy:
    case FrameBehavior.BatStart:
    case FrameBehavior.FirzenDisasterStart:
    case FrameBehavior.JohnBiscuitLeaving:
    case FrameBehavior.FirzenVolcanoStart:
    case FrameBehavior.Bat:
    case FrameBehavior.JulianBallStart:
    case FrameBehavior.JulianBall:
      break;
  }

  // if (is_character(victim) || is_weapon(victim)) {
  //   attacker.velocities.length = 1;
  //   switch (attacker.frame.state) {
  //     case ItrKind.JohnShield:
  //     case StateEnum.Ball_Flying:
  //       const { victim } = collision;
  //       victim.shaking = 0;
  //       victim.velocities.length = 1;
  //       victim.velocity_0.x = 0;
  //       victim.velocity_0.z = 0;
  //       victim.velocity_0.y = 0;
  //       break;
  //   }
  // }
}
