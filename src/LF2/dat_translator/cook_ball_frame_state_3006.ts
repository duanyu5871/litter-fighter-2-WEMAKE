import { IFrameInfo } from "../defines/IFrameInfo";
import { ItrKind } from "../defines/ItrKind";
import { CollisionVal as C_Val } from "../defines/CollisionVal";
import { IEntityData } from "../defines/IEntityData";
import { StateEnum } from "../defines/StateEnum";
import { CondMaker } from "./CondMaker";
import { ensure } from "../utils";
import { foreach } from "../utils/container_help/foreach";
import { ActionType } from "../defines/ActionType";

export function cook_ball_frame_state_3006(e: IEntityData, frame: IFrameInfo) {
  for (const bdy of frame.bdy || []) {
    bdy.actions = ensure(bdy.actions, {
      type: ActionType.NextFrame,
      test: new CondMaker<C_Val>()
        .one_of(C_Val.AttackerState, StateEnum.Ball_3005, StateEnum.Ball_3006)
        .or(C_Val.ItrKind, "==", ItrKind.JohnShield)
        .done(),
      data: {
        id: "20"
      }
    })
  }
  foreach(frame.itr, itr => {
    if (itr.kind === ItrKind.Normal)
      itr.actions = ensure(itr.actions, {
        type: ActionType.NextFrame,
        test: new CondMaker<C_Val>()
          .one_of(C_Val.VictimState, StateEnum.Ball_3005, StateEnum.Ball_3006)
          .done(),
        data: {
          id: "20"
        }
      })
  })
}
