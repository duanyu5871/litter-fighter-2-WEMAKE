import { IProjecttileData, IProjecttileFrameInfo, IProjecttileInfo, TFrameId } from "../lf2_type";
import { to_num } from "../to_num";
import { traversal } from "../traversal";
import { take } from "./take";

export function make_projecttile_data(info: IProjecttileInfo, frames: Record<TFrameId, IProjecttileFrameInfo>): IProjecttileData {

  for (const [, frame] of traversal(frames)) {
    const s = take(frame, 'hit_j');
    if (s !== 0) frame.speedz = (50 - to_num(s, 50))
    if (frame.dvx) frame.dvx /= 2
    if (frame.dvy) frame.dvy /= 2
    if (frame.dvz) frame.dvz /= 2
    // frame.hp = (50 to_num(take(frame, 'hit_a'), 0)) / 2
  }


  return {
    id: '',
    type: 'projecttile',
    base: info,
    frames: frames
  };
}
