import { IFrameInfo, ItrKind } from "../defines";
import { IEntityData } from "../defines/IEntityData";
import { EntityVal } from "../defines/EntityVal";
import { CondMaker } from "./CondMaker";

export function cook_ball_frame_state_3006(e: IEntityData, frame: IFrameInfo) {
  frame.ctrl_spd_z = 2;
  for (const bdy of frame.bdy || []) {
    bdy.hit_act = [
      {
        id: "20",
        expression: new CondMaker<EntityVal>()
          .add(EntityVal.HitByState, "{{", 3005)
          .or(EntityVal.HitByState, "{{", 3006)
          .or(EntityVal.HitByItrKind, "{{", ItrKind.JohnShield)
          .done(),
      },
    ];
  }
  for (const itr of frame.itr || []) {
    itr.hit_act = [
      {
        id: "20",
        expression: new CondMaker<EntityVal>()
          .add(EntityVal.HitOnState, "{{", 3005)
          .or(EntityVal.HitOnState, "{{", 3006)
          .done(),
      },
    ];
  }
}
