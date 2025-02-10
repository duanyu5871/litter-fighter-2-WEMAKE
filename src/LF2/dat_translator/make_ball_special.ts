import { BuiltIn_OID } from "../defines/js";
import { IEntityData } from "../defines/IEntityData";
import { traversal } from "../utils/container_help/traversal";

export function make_ball_special(data: IEntityData) {
  switch (data.id) {
    case BuiltIn_OID.FirenFlame:
      traversal(data.frames, (_, frame) => {
        if (frame.itr) for (const itr of frame.itr) delete itr.ally_flags;
      });
      break;
    case BuiltIn_OID.FirzenBall:
    case BuiltIn_OID.BatBall:
      traversal(data.frames, (_, frame) => {
        frame.ctrl_spd_z = 0;
        frame.no_shadow = 1;
      });
      break;
  }
}
