import { IFrameInfo } from "../defines/IFrameInfo";
import { ItrKind } from "../defines/ItrKind";
import { CollisionVal as C_Val } from "../defines/CollisionVal";
import { IEntityData } from "../defines/IEntityData";
import { StateEnum } from "../defines/StateEnum";
import { CondMaker } from "./CondMaker";
import { ensure } from "../utils";
import { foreach } from "../utils/container_help/foreach";

export function cook_ball_frame_state_3005(e: IEntityData, frame: IFrameInfo) {
  if (frame.bdy) {
    for (const bdy of frame.bdy) {
      bdy.actions = bdy.actions || [];
      bdy.actions.push({
        type: 'next_frame',
        test: new CondMaker<C_Val>()
          .add(C_Val.AttackerState, "==", StateEnum.Ball_3005)
          .or(C_Val.ItrKind, "==", ItrKind.JohnShield)
          .done(),
        data: {
          id: "20"
        }
      })
    }
  }
  foreach(frame.itr, itr => {
    itr.actions = ensure(itr.actions, {
      type: 'next_frame',
      test: new CondMaker<C_Val>()
        .add(C_Val.VictimState, "==", StateEnum.Ball_3005)
        .done(),
      data: { id: "20" }
    })
    if (e.base.hit_sounds?.length)
      itr.actions.push({
        type: 'sound',
        path: e.base.hit_sounds
      })
  })
}
