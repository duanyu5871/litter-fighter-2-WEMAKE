import { delete_val_equal_keys } from '../delete_val_equal_keys';
import { IBdyInfo, ICpointInfo, IItrInfo, IOpointInfo, IWpointInfo } from '../lf2_type';
import { IFrameInfo } from "../lf2_type/IFrameInfo";
import { Defines } from '../lf2_type/defines';
import { match_all } from '../match_all';
import { match_colon_value } from '../match_colon_value';
import { not_zero } from '../not_zero';
import { to_num } from '../to_num';
import cook_bdy from './cook_bdy';
import { cook_cpoint } from './cook_cpoint';
import cook_itr from './cook_itr';
import cook_opoint from './cook_opoint';
import { cook_wpoint } from './cook_wpoint';
import { get_next_frame_by_raw_id } from './get_the_next';
import { take } from './take';
import take_sections from './take_sections';

const handle_raw_mp = (mp: number | undefined) => {
  if (!mp) return [0, 0];
  if (mp < 1000 && mp > -1000) return [mp, 0];
  const _mp = mp % 1000;
  const hp = (mp - _mp) / 100;
  return [_mp, hp] as const;
}
export function make_frames<F extends IFrameInfo = IFrameInfo>(text: string): Record<string, F> {
  const frames: Record<string, F> = {};
  const frame_regexp = /<frame>\s+(.*?)\s+(.*)((.|\n)+?)<frame_end>/g;
  for (const [, frame_id, frame_name, content] of match_all(text, frame_regexp)) {
    let _content = content;
    const bdy_list = take_sections<IBdyInfo>(_content, 'bdy:', 'bdy_end:', r => _content = r);
    for (const bdy of bdy_list) cook_bdy(bdy)

    const itr_list = take_sections<IItrInfo>(_content, 'itr:', 'itr_end:', r => _content = r);
    for (const itr of itr_list) cook_itr(itr)

    const opoint_list = take_sections<IOpointInfo>(_content, 'opoint:', 'opoint_end:', r => _content = r);
    for (const opoint of opoint_list) cook_opoint(opoint);

    const wpoint_list = take_sections<IWpointInfo>(_content, 'wpoint:', 'wpoint_end:', r => _content = r);
    for (const wpoint of wpoint_list) cook_wpoint(wpoint);

    const bpoint_list = take_sections(_content, 'bpoint:', 'bpoint_end:', r => _content = r);

    const cpoint_list = take_sections<ICpointInfo>(_content, 'cpoint:', 'cpoint_end:', r => _content = r);
    for (const cpoint of cpoint_list) cook_cpoint(cpoint);

    const fields: any = {};
    for (const [name, value] of match_colon_value(_content)) fields[name] = to_num(value);

    const raw_next = take(fields, 'next');
    const next = get_next_frame_by_raw_id(raw_next);

    const wait = take(fields, 'wait') * 2 + 1;
    const frame: F = {
      id: frame_id,
      name: frame_name,
      wait,
      next,
      bdy: bdy_list,
      itr: itr_list,
      wpoint: wpoint_list[0],
      bpoint: bpoint_list[0],
      opoint: opoint_list,
      cpoint: cpoint_list[0],
      ...fields,
    };

    if (
      (raw_next >= 1100 && raw_next <= 1299) ||
      (raw_next <= -1100 && raw_next >= -1299)
    ) {
      frame.invisible = 2 * (Math.abs(raw_next) - 1100);
    }
    
    if (!frame.itr?.length) delete frame.itr;
    if (!frame.bdy?.length) delete frame.bdy;
    if (!frame.opoint?.length) delete frame.opoint;
    if (!frame.wpoint) delete frame.wpoint;
    if (!frame.bpoint) delete frame.bpoint;
    if (!frame.cpoint) delete frame.cpoint;


    delete_val_equal_keys(frame, ['mp', 'hp'], [0, void 0]);

    const sound = take(frame, 'sound');
    if (sound) frame.sound = sound + '.ogg';

    const [_mp, _hp] = handle_raw_mp(take(frame, 'mp'))
    if (_mp) frame.mp = _mp;
    if (_hp) frame.hp = _hp

    frames[frame_id] = frame;

    const dircontrol = take(cpoint_list, 'dircontrol');
    if (dircontrol) {
      frame.hold = frame.hold || {}
      frame.hold.B = { facing: Defines.FacingFlag.Backward, wait: 'i' }
    }

    const dvx = take(frame, 'dvx');
    if (dvx === 550) frame.dvx = dvx;
    else if (not_zero(dvx)) frame.dvx = dvx * 0.5;

    const dvz = take(frame, 'dvz');
    if (dvz === 550) frame.dvz = dvz;
    else if (not_zero(dvz)) frame.dvz = dvz * 0.5;

    const dvy = take(frame, 'dvy');
    if (dvy === 550) frame.dvy = dvy;
    else if (not_zero(dvy)) frame.dvy = dvy * -0.25;
  }
  return frames;
}



