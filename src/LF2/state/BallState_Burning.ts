import { IFrameInfo, StateEnum } from "../defines";
import { Entity } from "../entity";
import BallState_Base from "./BallState_Base";

export class BallState_Burning extends BallState_Base {
  override state: string | number = StateEnum.Burning;
  override enter(e: Entity, _prev_frame: IFrameInfo): void {
    e.velocities.length = 1;
    e.velocity_0.x = 0;
    e.velocity_0.y = 0;
    e.velocity_0.z = 0;
  }
}
