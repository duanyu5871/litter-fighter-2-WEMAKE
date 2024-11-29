import { IBdyInfo, ICpointInfo, IEntityPictureInfo, IFramePictureInfo, IGameObjInfo, IItrInfo, IOpointInfo, IWpointInfo } from '../defines';
import { IFrameInfo } from "../defines/IFrameInfo";
import { IRect } from '../defines/IRect';
import { IRectPair } from '../defines/IRectPair';
import { Defines } from '../defines/defines';
import { match_all } from '../utils/string_parser/match_all';
import { match_colon_value } from '../utils/string_parser/match_colon_value';
import take_sections from '../utils/string_parser/take_sections';
import { to_num } from '../utils/type_cast/to_num';
import { not_zero_num } from '../utils/type_check';
import cook_bdy from './cook_bdy';
import { cook_cpoint } from './cook_cpoint';
import cook_itr from './cook_itr';
import cook_opoint from './cook_opoint';
import { cook_wpoint } from './cook_wpoint';
import { get_next_frame_by_raw_id } from './get_the_next';
import { take } from './take';

const handle_raw_mp = (mp: number | undefined) => {
  if (!mp) return [0, 0];
  if (mp < 1000 && mp > -1000) return [mp, 0];
  const _mp = mp % 1000;
  const hp = (mp - _mp) / 100;
  return [_mp, hp] as const;
}
export function make_frames<F extends IFrameInfo = IFrameInfo>(text: string, files: IGameObjInfo['files']): Record<string, F> {
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
    for (const [name, value] of match_colon_value(_content))
      fields[name] = to_num(value) ?? value;

    const raw_next = take(fields, 'next');
    const next = get_next_frame_by_raw_id(raw_next);
    let pic_idx = take(fields, 'pic');
    let frame_pic_info: IFramePictureInfo | undefined = void 0;
    let entity_pic_info: IEntityPictureInfo | undefined = void 0;
    for (const key in files) {
      entity_pic_info = files[key];
      const ret = pic_idx >= entity_pic_info.begin && pic_idx <= entity_pic_info.end;
      if (ret) {
        pic_idx -= entity_pic_info.begin;
        break;
      }
    }
    if (entity_pic_info) {
      const { id, row, cell_w, cell_h } = entity_pic_info;
      frame_pic_info = {
        tex: id,
        x: (cell_w + 1) * (pic_idx % row),
        y: (cell_h + 1) * Math.floor(pic_idx / row),
        w: cell_w,
        h: cell_h,
      }
    }

    const wait = take(fields, 'wait') * 2 + 1;
    const frame: F = {
      id: frame_id,
      name: frame_name,
      pic: frame_pic_info,
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

    if (frame_pic_info) {
      const ii: IRect = {
        x: -frame.centerx,
        y: frame.centery - frame_pic_info.h,
        w: frame_pic_info.w,
        h: frame_pic_info.h
      }
      const ii_1: IRect = {
        ...ii,
        x: frame.centerx - ii.w
      }
      frame.indicator_info = { 1: ii, [-1]: ii_1 }
      bdy_list.forEach(bdy => {
        const i_1: IRect = {
          w: bdy.w,
          h: bdy.h,
          x: ii.x + bdy.x,
          y: ii.y + ii.h - bdy.y - bdy.h,
        };
        const i_2 = {
          ...i_1,
          x: ii_1.x + ii.w - bdy.w - bdy.x,
        };
        bdy.indicator_info = { 1: i_1, [-1]: i_2 };
      })
      itr_list.forEach(itr => {
        const i_1: IRect = {
          w: itr.w,
          h: itr.h,
          x: ii.x + itr.x,
          y: ii.y + ii.h - itr.y - itr.h,
        };
        const i_2 = {
          ...i_1,
          x: ii_1.x + ii.w - itr.w - itr.x,
        };
        itr.indicator_info = { 1: i_1, [-1]: i_2 };
      })
    }


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


    if (!frame.mp) delete frame.mp;
    if (!frame.hp) delete frame.hp;

    const sound = take(frame, 'sound');
    if (sound) frame.sound = sound + '.mp3';

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
    else if (not_zero_num(dvx)) frame.dvx = dvx * 0.5;

    const dvz = take(frame, 'dvz');
    if (dvz === 550) frame.dvz = dvz;
    else if (not_zero_num(dvz)) frame.dvz = dvz * 0.5;

    const dvy = take(frame, 'dvy');
    if (dvy === 550) frame.dvy = dvy;
    else if (not_zero_num(dvy)) frame.dvy = dvy * -0.25;

    switch (frame.state) {
      case Defines.State.Ball_Sturdy:
        frame.no_shadow = 1;
        break;
      case Defines.State.HeavyWeapon_OnHand:
        frame.no_shadow = 1;
        break;
      case Defines.State.Weapon_OnHand:
        frame.no_shadow = 1;
        break;
    }
  }
  return frames;
}



