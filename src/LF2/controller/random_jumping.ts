import { StateEnum, GameKey as GK } from "../defines";
import { BotController } from "./BotController";

export function random_jumping(ctrl: BotController) {
  const { state } = ctrl.entity.frame;
  switch (state) {
    case StateEnum.Standing:
    case StateEnum.Walking:
    case StateEnum.Running: {
      if (ctrl.desire() < ctrl.JUMP_DESIRE) {
        ctrl.key_down(GK.j);
      } else {
        ctrl.key_up(GK.j);
      }
      break;
    }
    default:
      ctrl.key_up(GK.j);
  }
}
