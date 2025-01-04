import { IFrameInfo, ItrKind } from "../defines";
import { CollisionVal as C_Val } from "../defines/CollisionVal";
import { IEntityData } from "../defines/IEntityData";
import { State } from "../defines/State";
import { CondMaker } from "./CondMaker";

export function cook_ball_frame_state_3005(e: IEntityData, frame: IFrameInfo) {
  frame.ctrl_spd_z = 0;
  if (frame.bdy) {
    for (const bdy of frame.bdy) {
      bdy.actions = bdy.actions || [];
      bdy.actions.push({
        type: 'next_frame',
        test: new CondMaker<C_Val>()
          .add(C_Val.AttackerState, "==", State.Ball_3005)
          .or(C_Val.ItrKind, "==", ItrKind.JohnShield)
          .done(),
        data: {
          id: "20"
        }
      })
    }
  }
  if (frame.itr) {
    for (const itr of frame.itr) {
      itr.actions = itr.actions || [];
      itr.actions.push({
        type: 'next_frame',
        test: new CondMaker<C_Val>()
          .add(C_Val.VictimState, "==", State.Ball_3005)
          .done(),
        data: {
          id: "20"
        }
      })
    }
  }
}
