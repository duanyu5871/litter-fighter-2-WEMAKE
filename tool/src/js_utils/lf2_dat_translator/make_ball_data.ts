import { IBallData, IBallFrameInfo, IBallInfo, IDatIndex } from "../lf2_type";
import { Defines } from "../lf2_type/defines";
import { to_num } from "../to_num";
import { traversal } from "../traversal";
import { get_next_frame_by_id } from "./get_the_next";
import { take } from "./take";

export function make_ball_data(info: IBallInfo, frames: Record<string, IBallFrameInfo>, datIndex?: IDatIndex): IBallData {

  for (const [, frame] of traversal(frames)) {
    const hit_j = take(frame, 'hit_j');
    if (hit_j !== 0) frame.dvz = to_num(hit_j, 50) - 50;

    const hit_a = take(frame, 'hit_a');
    const hit_d = take(frame, 'hit_d');
    if (hit_a) frame.hp = hit_a / 2;
    if (hit_d) frame.on_dead = get_next_frame_by_id(hit_d);
    if (frame.state === Defines.State.NormalBall) {
      frame.speedz = 2;
      if (frames[10]) frame.on_hitting = { id: '10' }
      if (frames[20]) frame.on_be_hit = { id: '20' }
      if (frames[30]) frame.on_rebounding = { id: '30' }
      if (frames[40]) frame.on_disappearing = { id: '40' }
    } else if (frame.state === Defines.State.SturdyBall) {
      frame.speedz = 0;
      frame.no_shadow = 1;
    } else if (frame.state === Defines.State.PunchThroughBall) {
      frame.speedz = 2;
    } else if (frame.state === 18) {
      if (frame.itr && Number(datIndex?.id) === 229) {
        // julian ball 2 explosion
        for (const itr of frame.itr) {
          itr.friendly_fire = 1;
        }
      }
    }

    switch ('' + datIndex?.id) {
      case '223':
      case '224':
        frame.speedz = 0;
        frame.no_shadow = 1;
        break;
    }

    // 223、224
    // frame.hp = (50 to_num(take(frame, 'hit_a'), 0)) / 2
  }
  info.hp = 500;

  return {
    id: '',
    type: 'ball',
    base: info,
    frames: frames
  };
}
