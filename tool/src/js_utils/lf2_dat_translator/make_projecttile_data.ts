import { IProjecttileInfo, TFrameId, IFrameInfo, IProjecttileData } from "../lf2_type";
import { to_num } from "../to_num";
import { traversal } from "../traversal";
import { take } from "./take";

export function make_projecttile_data(info: IProjecttileInfo, frames: Record<TFrameId, IFrameInfo>): IProjecttileData {

  for (const [, frame] of traversal(frames)) {
    if (frame.dvx) frame.dvx /= 2
    if (frame.dvy) frame.dvy /= 2

    frame.dvz = (50 - to_num(take(frame, 'hit_j'), 0)) / 2
    // frame.hp = (50 to_num(take(frame, 'hit_a'), 0)) / 2
  }


  return {
    id: '',
    type: 'projecttile',
    base: info,
    frames: frames
  };
}
