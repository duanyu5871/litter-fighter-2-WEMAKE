import { StateEnum, GameKey as GK } from "../defines";
import { BotController } from "./BotController";

export function random_jumping(c: BotController) {
  const { state } = c.entity.frame;
  const desire = c.desire()
  switch (state) {
    case StateEnum.Running: {
      (
        desire < c.dash_desire ?
          c.key_down :
          c.key_up
      ).call(c, GK.j)
      break;
    }
    case StateEnum.Standing:
    case StateEnum.Walking: {
      (
        desire < c.jump_desire ?
          c.key_down :
          c.key_up
      ).call(c, GK.j)
      break;
    }
    default:
      c.key_up(GK.j);
  }
}
