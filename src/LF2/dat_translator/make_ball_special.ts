import { IEntityData } from "../defines/IEntityData";
import { traversal } from "../utils/container_help/traversal";

export function make_ball_special(data: IEntityData) {
  switch (data.id) {
    case "211": {
      traversal(data.frames, (_, frame) => {
        if (frame.itr) for (const itr of frame.itr) delete itr.ally_flags;
      });
      break;
    }
    case "223":
    case "224": {
      traversal(data.frames, (_, frame) => {
        frame.ctrl_spd_z = 0;
        frame.no_shadow = 1;
      });
      break;
    }
  }
}
