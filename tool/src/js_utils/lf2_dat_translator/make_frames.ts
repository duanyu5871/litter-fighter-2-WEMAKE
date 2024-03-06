import { delete_val_equal_keys } from '../delete_val_equal_keys';
import { IFrameInfo, IItrInfo, TFrameId } from '../lf2_type';
import { Defines } from '../lf2_type/defines';
import { match_all } from '../match_all';
import { match_colon_value } from '../match_colon_value';
import { to_num } from '../to_num';
import { get_next_frame_by_id } from './get_the_next';
import { take } from './take';
import take_sections from './take_sections';

export function make_frames<F extends IFrameInfo = IFrameInfo>(text: string): Record<TFrameId, F> {
  const frames: Record<TFrameId, F> = {};
  const frame_regexp = /<frame>\s+(.*?)\s+(.*)((.|\n)+?)<frame_end>/g;
  for (const [, frame_id, frame_name, content] of match_all(text, frame_regexp)) {
    let _content = content;
    const bdy_list = take_sections(_content, 'bdy:', 'bdy_end:', r => _content = r);
    const itr_list = take_sections<IItrInfo>(_content, 'itr:', 'itr_end:', r => _content = r);
    itr_list?.forEach(itr => {
      delete_val_equal_keys(itr, ['dvx', 'dvy', 'dvz'], [0, void 0]);
      const vrest = take(itr, 'vrest')
      const arest = take(itr, 'arest')
      if (typeof vrest === 'number') { itr.vrest = Math.max(1, 2 * (vrest - 1)); }
      if (typeof arest === 'number') { itr.arest = Math.max(1, 2 * (arest - 1)); }
      if (typeof itr.dvx === 'number') itr.dvx *= 0.52;
      if (typeof itr.dvz === 'number') itr.dvz *= 0.52;
      if (typeof itr.dvy === 'number') itr.dvy *= -0.52;
      switch (itr.kind) {
        case Defines.ItrKind.SuperPunchMe:
        case Defines.ItrKind.ForceCatch:
        case Defines.ItrKind.Catch:
          itr.motionless = 0;
          itr.shaking = 0;
      }
    });
    const opoint_list = take_sections(_content, 'opoint:', 'opoint_end:', r => _content = r);
    opoint_list?.forEach(v => {
      delete_val_equal_keys(v, ['dvx', 'dvy', 'dvz'], [0, void 0]);
      if (typeof v.dvx === 'number') v.dvx *= 0.5;
      if (typeof v.dvz === 'number') v.dvz *= 0.5;
      if (typeof v.dvy === 'number') v.dvy *= -0.5;
    });

    const wpoint = take_sections(_content, 'wpoint:', 'wpoint_end:', r => _content = r)[0];
    const bpoint = take_sections(_content, 'bpoint:', 'bpoint_end:', r => _content = r)[0];
    const cpoint = take_sections(_content, 'cpoint:', 'cpoint_end:', r => _content = r)[0];
    if (cpoint) {
      delete_val_equal_keys(cpoint, ['throwvx', 'throwvy', 'throwvz', 'throwinjury'], [0, void 0, -842150451]);
      if (typeof cpoint.throwvx === 'number') cpoint.throwvx *= 0.5;
      if (typeof cpoint.throwvy === 'number') { cpoint.throwvy *= -0.5; }

      if (cpoint.vaction) {
        const vaction = get_next_frame_by_id(cpoint.vaction);
        vaction.flags = { turn: 5 };
        cpoint.vaction = vaction;
      }
    }


    const fields: any = {};
    for (const [name, value] of match_colon_value(_content)) fields[name] = to_num(value);

    const frame: F = {
      ...fields,
      id: frame_id,
      name: frame_name,
      wait: fields.wait * 2 + 2,
      next: get_next_frame_by_id(fields.next),
      bdy: bdy_list,
      itr: itr_list,
      wpoint,
      bpoint,
      opoint: opoint_list,
      cpoint,
    };

    if (!bdy_list?.length) delete frame.bdy;
    if (!itr_list?.length) delete frame.itr;
    if (!opoint_list?.length) delete frame.opoint;
    delete_val_equal_keys(frame, ['dvx', 'dvy', 'dvz'], [0, void 0]);
    delete_val_equal_keys(frame, ['mp', 'hp'], [0, void 0]);
    delete_val_equal_keys(frame, ['sound'], ['', void 0]);
    delete_val_equal_keys(frame, ['sound'], ['', void 0]);
    delete_val_equal_keys(frame, ['wpoint', 'bpoint', 'cpoint', 'bdy', 'itr'], [null, void 0]);
    delete_val_equal_keys(frame.wpoint, ['dvx', 'dvy', 'dvz'], [0, void 0]);

    if (frame.mp && frame.mp > 1000) {
      const raw = frame.mp;
      frame.mp = raw % 1000;
      frame.hp = (raw - frame.mp) / 100;
    }
    frames[frame_id] = frame;

    const dircontrol = take(cpoint, 'dircontrol');
    if (dircontrol) {
      frame.hold = frame.hold || {}
      frame.hold.B = { id: '', flags: { turn: 1, wait: 'i' } }
    }
    if (frame.dvx) frame.dvx /= 2
    if (frame.dvy) frame.dvy /= 4
    if (frame.dvz) frame.dvz /= 2
  }
  return frames;
}
