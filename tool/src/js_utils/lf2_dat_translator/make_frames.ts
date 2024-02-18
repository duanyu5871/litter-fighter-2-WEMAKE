import { delete_val_equal_keys } from '../delete_val_equal_keys';
import { match_all } from '../match_all';
import { match_colon_value } from '../match_colon_value';
import { to_num } from '../to_num';
import { get_next_frame_by_id } from './get_the_next';
import take_sections from './take_sections';

export function make_frames(text: string): Record<TFrameId, IFrameInfo> {
  const frames: Record<TFrameId, IFrameInfo> = {};
  const frame_regexp = /<frame>\s+(.*?)\s+(.*)((.|\n)+?)<frame_end>/g;
  for (const [, frame_id, frame_name, content] of match_all(text, frame_regexp)) {
    let _content = content;
    const bdy = take_sections(_content, 'bdy:', 'bdy_end:', r => _content = r);
    const itr = take_sections(_content, 'itr:', 'itr_end:', r => _content = r);
    itr?.forEach(v => {
      if (typeof v.dvx === 'number') v.dvx /= 2;
      if (typeof v.dvz === 'number') v.dvz /= 2;
      if (typeof v.dvy === 'number') v.dvy *= -1.1;
    });
    const wpoint = take_sections(_content, 'wpoint:', 'wpoint_end:', r => _content = r)[0];
    const bpoint = take_sections(_content, 'bpoint:', 'bpoint_end:', r => _content = r)[0];
    const opoint = take_sections(_content, 'opoint:', 'opoint_end:', r => _content = r)[0];
    const cpoint = take_sections(_content, 'cpoint:', 'cpoint_end:', r => _content = r)[0];

    const fields: any = {};
    for (const [name, value] of match_colon_value(_content)) fields[name] = to_num(value);

    const frame: IFrameInfo = {
      ...fields,
      id: frame_id,
      name: frame_name,
      wait: fields.wait * 2 + 2,
      next: get_next_frame_by_id(fields.next),
      bdy,
      itr,
      wpoint,
      bpoint,
      opoint,
      cpoint,
    };

    if (!bdy?.length) delete frame.bdy;
    if (!itr?.length) delete frame.itr;
    delete_val_equal_keys(frame, ['dvx', 'dvy', 'dvz'], [0, void 0]);
    delete_val_equal_keys(frame, ['mp', 'hp'], [0, void 0]);
    delete_val_equal_keys(frame, ['sound'], ['', void 0]);
    delete_val_equal_keys(frame, ['sound'], ['', void 0]);
    delete_val_equal_keys(frame, ['wpoint', 'bpoint', 'opoint', 'cpoint', 'bdy', 'itr'], [null, void 0]);
    delete_val_equal_keys(frame.wpoint, ['dvx', 'dvy', 'dvz'], [0, void 0]);
    delete_val_equal_keys(frame.opoint, ['dvx', 'dvy', 'dvz'], [0, void 0]);
    delete_val_equal_keys(frame.cpoint, ['throwvx', 'throwvy', 'throwvz', 'throwinjury'], [0, void 0, -842150451]);

    if (frame.mp && frame.mp > 1000) {
      const raw = frame.mp;
      frame.mp = raw % 1000;
      frame.hp = (raw - frame.mp) / 100;
    }
    frames[frame_id] = frame;
  }
  return frames;
}
