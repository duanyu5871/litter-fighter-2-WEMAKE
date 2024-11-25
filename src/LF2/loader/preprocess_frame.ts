import { Warn } from '../../Log';
import { IEntityPictureInfo, IFrameInfo, IGameObjData, ITexturePieceInfo } from '../defines';
import { IRect } from '../defines/IRect';
import { traversal } from '../utils/container_help/traversal';
import LF2 from '../LF2';
import read_nums from '../layout/utils/read_nums';
import { cook_next_frame } from './preprocess_next_frame';
const get_keys = <V extends {}>(v: V): (keyof V)[] => {
  return Object.keys(v) as (keyof V)[]
}
export const cook_frame = (lf2: LF2, data: IGameObjData, frame: IFrameInfo) => {
  let pic = frame.pic;
  let pic_info: IEntityPictureInfo | undefined = void 0;
  if (frame.sound && !lf2.sounds.has(frame.sound))
    lf2.sounds.load(frame.sound, frame.sound);
  cook_frame_hit(frame);
  cook_frame_hold(frame);

  const unchecked_frame = (frame as any);
  if (unchecked_frame) {
    if (unchecked_frame.center) {
      const [x, y] = read_nums(unchecked_frame.center, 2, [frame.centerx ?? 0, frame.centery ?? 0])
      frame.centerx = x;
      frame.centery = y;
    }
  }

  if (typeof pic === 'number') {
    for (const key in data.base.files) {
      pic_info = data.base.files[key];
      const ret = pic >= pic_info.begin && pic <= pic_info.end;
      if (ret) { pic -= pic_info.begin; break; }
    }
    if (pic_info === void 0)
      return Warn.print(cook_frame.TAG, 'file info not found, data:', data, 'pic number:', pic);

    const { id, row, cell_w, cell_h } = pic_info;
    const x = (cell_w + 1) * (pic % row);
    const y = (cell_h + 1) * Math.floor(pic / row);
    pic = frame.pic = { tex: id!, x, y, w: cell_w, h: cell_h }
  }
  if ('x' in pic) {
    for (const key in data.base.files) {
      if (data.base.files[key].id === pic.tex) {
        pic_info = data.base.files[key];
        break;
      }
    }
    if (pic_info === void 0) return Warn.print(cook_frame.TAG, 'file info not found, pic number:', pic);
    const p = lf2.images.find_by_pic_info(pic_info);
    if (!p) return Warn.print(cook_frame.TAG, 'image_info not found', pic_info);

    const scale_img_w = p.w / p.scale;
    const scale_img_h = p.h / p.scale;
    const f_i_1: ITexturePieceInfo = {
      tex: pic.tex!,
      x: pic.x / scale_img_w,
      y: 1 - (pic.y + pic.h) / scale_img_h,
      w: pic.w / scale_img_w,
      h: pic.h / scale_img_h,
      pw: pic.w,
      ph: pic.h,
    };
    const f_i_2: ITexturePieceInfo = {
      ...f_i_1,
      x: -f_i_1.x - f_i_1.w
    };
    pic = frame.pic = {
      1: f_i_1,
      [-1]: f_i_2,
    };

  }
  const f_i_1 = pic[1];
  const ii: IRect = {
    x: -frame.centerx,
    y: frame.centery - f_i_1.ph,
    w: f_i_1.pw,
    h: f_i_1.ph
  }
  const ii_1: IRect = {
    ...ii,
    x: frame.centerx - ii.w
  }
  frame.indicator_info = { 1: ii, [-1]: ii_1 }

  frame.bdy?.forEach(bdy => {
    const b_ii: IRect = {
      w: bdy.w,
      h: bdy.h,
      x: ii.x + bdy.x,
      y: ii.y + ii.h - bdy.y - bdy.h,
    };
    const b_ii_1 = {
      ...b_ii,
      x: ii_1.x + ii.w - bdy.w - bdy.x,
    };
    bdy.indicator_info = { 1: b_ii, [-1]: b_ii_1 };
  });

  frame.itr?.forEach(itr => {
    const i_ii: IRect = {
      w: itr.w,
      h: itr.h,
      x: ii.x + itr.x,
      y: ii.y + ii.h - itr.y - itr.h,
    };
    const i_ii_1 = {
      ...i_ii,
      x: ii_1.x + ii.w - itr.w - itr.x,
    };
    itr.indicator_info = { 1: i_ii, [-1]: i_ii_1 };
  });

};
cook_frame.TAG = 'cook_frame'

const cook_frame_hit = (frame: IFrameInfo) => {
  const hit = frame.hit;
  if (!hit) return;

  hit.sequences && traversal(hit.sequences, (k, v) => v && cook_next_frame(v));

  hit && get_keys(hit).forEach(k => {
    if (k === 'sequences') return;
    const v = hit[k];
    v && cook_next_frame(v);
  });
}


function cook_frame_hold(frame: IFrameInfo) {
  const hold = frame.hold;
  hold && get_keys(hold).forEach(k => {
    const v = hold[k];
    if (v) cook_next_frame(v);
  });
}

