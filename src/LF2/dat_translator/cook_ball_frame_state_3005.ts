import { IEntityData, IFrameInfo, ItrKind } from "../defines";
import { EntityVal } from "../defines/EntityVal";
import { CondMaker } from "./CondMaker";

export function cook_ball_frame_state_3005(e: IEntityData, frame: IFrameInfo) {
  frame.speedz = 0;
  if (frame.bdy) {
    for (const bdy of frame.bdy) {
      bdy.hit_act = [{
        id: '20',
        expression: new CondMaker<EntityVal>()
          .add(EntityVal.HitByState, '{{', 3005)
          .or(EntityVal.HitByItrKind, '{{', ItrKind.JohnShield)
          .done()
      }];
    }
  }
  if (frame.itr) {
    for (const itr of frame.itr) {
      itr.hit_act = [{
        id: '20',
        expression: new CondMaker<EntityVal>()
          .add(EntityVal.HitOnState, '{{', 3005)
          .done()
      }];
    }
  }
}
