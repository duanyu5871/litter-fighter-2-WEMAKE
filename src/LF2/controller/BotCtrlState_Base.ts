import { IState } from "../base/FSM";
import { abs } from "../utils/math/base";
import { BotController } from "./BotController";
import { BotCtrlState } from "./BotCtrlState";

export abstract class BotCtrlState_Base implements IState<BotCtrlState> {
  abstract key: BotCtrlState;
  readonly ctrl: BotController
  constructor(ctrl: BotController) {
    this.ctrl = ctrl;
  }
  update?(dt: number): BotCtrlState | undefined | void;
  enter?(): void;
  leave?(): void;
}
