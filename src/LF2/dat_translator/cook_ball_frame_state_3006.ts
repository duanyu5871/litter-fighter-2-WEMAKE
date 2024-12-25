import { IEntityData, IFrameInfo, ItrKind } from "../defines";
import { EntityVal } from "../defines/EntityVal";
import { CondMaker } from "./CondMaker";

export function cook_ball_frame_state_3006(e: IEntityData, frame: IFrameInfo) {
  frame.speedz = 2;
  if (frame.bdy) {
    for (const bdy of frame.bdy) {
      bdy.hit_act = [{
        id: '20',
        expression: new CondMaker<EntityVal>()
          .add(EntityVal.HitByState, '{{', 3005)
          .or(EntityVal.HitByState, '{{', 3006)
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
          .or(EntityVal.HitOnState, '{{', 3006)
          .done()
      }];
    }
  }
}
