import { IEntityData } from '../defines';
import { traversal } from '../utils/container_help/traversal';

export function make_ball_special(data: IEntityData) {
  switch (data.id) {
    case '211': {
      traversal(data.frames, (_, frame) => {
        if (frame.itr)
          for (const itr of frame.itr)
            delete itr.friendly_fire;
      })
      break;
    }
    case '223':
    case '224': {
      traversal(data.frames, (_, frame) => {
        frame.speedz = 0;
        frame.no_shadow = 1;
      })
      break;
    }
  }
}
