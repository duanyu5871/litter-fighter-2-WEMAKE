import { ICollision } from "../base";
import { FrameBehavior } from "../defines";

export function handle_ball_hit_other(collision: ICollision): void {
  const { attacker, aframe } = collision;
  switch (aframe.behavior as FrameBehavior) {
    case FrameBehavior.JohnChase:
      attacker.hp = attacker.hp_r = 0;
      break;
    case FrameBehavior.DennisChase:
    case FrameBehavior._03:
    case FrameBehavior._04:
    case FrameBehavior._05:
    case FrameBehavior.DevilJudgementStart:
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
  attacker.play_sound(attacker.data.base.hit_sounds)
}
