import { delete_val_equal_keys } from '../delete_val_equal_keys';
import { is_num } from '../is_num';
import { is_positive_num } from '../is_positive_num';
import { is_str } from '../is_str';
import { IBdyInfo, ICpointInfo, IItrInfo, IOpointInfo, IWpointInfo } from '../lf2_type';
import { IFrameInfo } from "../lf2_type/IFrameInfo";
import { Defines } from '../lf2_type/defines';
import { match_all } from '../match_all';
import { match_colon_value } from '../match_colon_value';
import { not_zero } from '../not_zero';
import { to_num } from '../to_num';
import { get_next_frame_by_id } from './get_the_next';
import { take } from './take';
import take_sections from './take_sections';

export function make_frames<F extends IFrameInfo = IFrameInfo>(text: string): Record<string, F> {
  const frames: Record<string, F> = {};
  const frame_regexp = /<frame>\s+(.*?)\s+(.*)((.|\n)+?)<frame_end>/g;
  for (const [, frame_id, frame_name, content] of match_all(text, frame_regexp)) {
    let _content = content;
    const bdy_list = take_sections<IBdyInfo>(_content, 'bdy:', 'bdy_end:', r => _content = r);

    const itr_list = take_sections<IItrInfo>(_content, 'itr:', 'itr_end:', r => _content = r);
    cook_itr_list(itr_list);

    const opoint_list = take_sections<IOpointInfo>(_content, 'opoint:', 'opoint_end:', r => _content = r);
    cook_opoint_list(opoint_list);

    const wpoint = take_sections<IWpointInfo>(_content, 'wpoint:', 'wpoint_end:', r => _content = r)[0];
    wpoint && cook_wpoint(wpoint);

    const bpoint = take_sections(_content, 'bpoint:', 'bpoint_end:', r => _content = r)[0];
    const cpoint = take_sections<ICpointInfo>(_content, 'cpoint:', 'cpoint_end:', r => _content = r)[0];
    cpoint && cook_cpoint(cpoint);

    const fields: any = {};
    for (const [name, value] of match_colon_value(_content)) fields[name] = to_num(value);

    const next = get_next_frame_by_id(take(fields, 'next'));
    const wait = take(fields, 'wait') * 2 + 1;
    const frame: F = {
      id: frame_id,
      name: frame_name,
      wait,
      next,
      bdy: bdy_list,
      itr: itr_list,
      wpoint,
      bpoint,
      opoint: opoint_list,
      cpoint,
      ...fields,
    };

    if (!bdy_list?.length) delete frame.bdy;
    if (!itr_list?.length) delete frame.itr;
    if (!opoint_list?.length) delete frame.opoint;
    delete_val_equal_keys(frame, ['mp', 'hp'], [0, void 0]);
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
      frame.hold.B = { facing: Defines.FacingFlag.Backward, wait: 'i' }
    }

    const dvx = take(frame, 'dvx');
    if (not_zero(dvx)) frame.dvx = dvx * 0.5;

    const dvz = take(frame, 'dvz');
    if (not_zero(dvz)) frame.dvz = dvz * 0.5;

    const dvy = take(frame, 'dvy');
    if (not_zero(dvy)) frame.dvy = dvy * -0.25;

  }
  return frames;
}


function cook_wpoint(unsure_wpoint: IWpointInfo) {
  const dvx = take(unsure_wpoint, 'dvx');
  if (not_zero(dvx)) unsure_wpoint.dvx = dvx * 0.5;

  const dvz = take(unsure_wpoint, 'dvz');
  if (not_zero(dvz)) unsure_wpoint.dvz = dvz;

  const dvy = take(unsure_wpoint, 'dvy');
  if (not_zero(dvy)) unsure_wpoint.dvy = dvy * -0.5;
}

function cook_cpoint(unsure_cpoint: ICpointInfo) {
  const tvx = take(unsure_cpoint, 'throwvx');
  if (not_zero(tvx) && tvx !== -842150451) unsure_cpoint.throwvx = tvx * 0.5;

  const tvy = take(unsure_cpoint, 'throwvy');
  if (not_zero(tvy) && tvy !== -842150451) unsure_cpoint.throwvy = tvy * -0.5;

  const tvz = take(unsure_cpoint, 'throwvz');
  if (not_zero(tvz) && tvz !== -842150451) unsure_cpoint.throwvy = tvz;

  const tvj = take(unsure_cpoint, 'throwinjury');
  if (not_zero(tvj) && tvj !== -842150451) unsure_cpoint.throwinjury = tvj;

  const vaction = take(unsure_cpoint as any, 'vaction');

  if (is_str(vaction) || is_num(vaction)) {
    unsure_cpoint.vaction = {
      ...get_next_frame_by_id(vaction),
      facing: Defines.FacingFlag.SameAsCatcher
    };
  }
}

function cook_opoint_list(unsure_opoint_list: IOpointInfo[]) {
  for (const item of unsure_opoint_list) {
    const action = take(item, 'action')
    if (is_num(action)) item.action = get_next_frame_by_id(action);

    const dvx = take(item, 'dvx');
    if (not_zero(dvx)) item.dvx = dvx * 0.5;

    const dvz = take(item, 'dvz');
    if (not_zero(dvz)) item.dvz = dvz * 0.5;

    const dvy = take(item, 'dvy');
    if (not_zero(dvy)) item.dvy = dvy * -0.5;


    const facing = take(item, 'facing')
    item.multi = 1;
    if (is_num(facing)) {
      item.facing = facing % 2 ?
        Defines.FacingFlag.Backward :
        Defines.FacingFlag.None;
      if (Math.abs(facing) >= 10) {
        item.multi = Math.floor(facing /  10);
      }
    } else {
      item.facing = Defines.FacingFlag.None;
      item.multi = 1;
    }
  }
}

function cook_itr_list(unsure_itr_list: IItrInfo[]) {
  for (const item of unsure_itr_list) {
    const vrest = take(item, 'vrest');
    if (is_positive_num(vrest)) { item.vrest = Math.max(1, 2 * vrest - 2); }

    const arest = take(item, 'arest');
    if (is_positive_num(arest)) { item.arest = Math.max(1, 2 * arest - 2); }

    const dvx = take(item, 'dvx');
    if (not_zero(dvx)) item.dvx = dvx * 0.55;

    const dvz = take(item, 'dvz');
    if (not_zero(dvz)) item.dvz = dvz * 0.5;

    const dvy = take(item, 'dvy');
    if (not_zero(dvy)) item.dvy = dvy * -0.55;//??

    switch (item.kind) {
      case Defines.ItrKind.SuperPunchMe: {
        item.motionless = 0;
        item.shaking = 0;
        break;
      }
      case Defines.ItrKind.ForceCatch:
      case Defines.ItrKind.Catch: {
        item.motionless = 0;
        item.shaking = 0;
        if (item.vrest) {
          item.arest = item.vrest;
          delete item.vrest;
        }
      }
    }

    const catchingact = take(item as any, 'catchingact')
    if (is_num(catchingact)) item.catchingact = get_next_frame_by_id(catchingact)

    const caughtact = take(item as any, 'caughtact')
    if (is_num(caughtact)) item.caughtact = {
      ...get_next_frame_by_id(caughtact),
      facing: Defines.FacingFlag.OpposingCatcher,
    }
  }
}

