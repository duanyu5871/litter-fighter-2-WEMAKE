import { IEntityPictureInfo, IFrameInfo, IGameObjData, ITexturePieceInfo } from '../js_utils/lf2_type';
import { traversal } from '../js_utils/traversal';
import { sound_mgr } from './loader/SoundMgr';
import { image_pool } from './loader/loader';
import { preprocess_next_frame } from './preprocess_next_frame';
const get_keys = <V extends {}>(v: V): (keyof V)[] => {
  return Object.keys(v) as (keyof V)[]
}
export const cook_frame = (data: IGameObjData, frame: IFrameInfo) => {

  let pic = frame.pic;
  let info: IEntityPictureInfo | undefined = void 0;
  if (frame.sound) sound_mgr.load(frame.sound, require('./' + frame.sound));
  cook_frame_hit(frame);
  cook_frame_hold(frame);

  if (typeof pic === 'number') {
    for (const key in data.base.files) {
      info = data.base.files[key];
      const ret = pic >= info.begin && pic <= info.end;
      if (ret) { pic -= info.begin; break; }
    }
    if (info === void 0) return console.log('NOT FOUND');

    const { id, row, w: cell_w, h: cell_h } = info;
    const p = image_pool.find_by_pic_info(info);
    if (!p) return console.log('[preprocess_frame] image_info not found,', info);
    const x = (cell_w + 1) * (pic % row);
    const y = (cell_h + 1) * Math.floor(pic / row);
    pic = frame.pic = { tex: id!, x, y, w: cell_w, h: cell_h }
  }

  if ('x' in pic) {
    for (const key in data.base.files) {
      if (data.base.files[key].id === pic.tex) {
        info = data.base.files[key];
        break;
      }
    }
    if (info === void 0) return console.warn('NOT FOUND');
    const p = image_pool.find_by_pic_info(info);
    if (!p) return console.warn('[preprocess_frame] image_info not found', info);

    const f_i_1: ITexturePieceInfo = {
      tex: pic.tex!,
      x: pic.x / p.w,
      y: 1 - (pic.y + pic.h) / p.h,
      w: pic.w / p.w,
      h: pic.h / p.h,
      pw: pic.w,
      ph: pic.h,
      cx: frame.centerx / pic.w,
      cy: 1 - frame.centery / pic.h,
    };
    const f_i_2: ITexturePieceInfo = {
      ...f_i_1,
      x: -f_i_1.x - f_i_1.w,
      cx: 1 - frame.centerx / pic.w,
    };
    pic = frame.pic = {
      1: f_i_1,
      [-1]: f_i_2,
    };

  }
  const f_i_1 = pic[1];
  const { pw: cell_w, ph: cell_h } = f_i_1;
  frame.bdy?.forEach(bdy => {
    const face_1 = {
      tex: 0, pw: 0, ph: 0,
      cx: 0, cy: 0,
      w: bdy.w / cell_w,
      h: bdy.h / cell_h,
      x: bdy.x / cell_w - f_i_1.cx,
      y: 1 - (bdy.y + bdy.h) / cell_h,
    };
    const face_2 = {
      ...face_1, cx: 1, x: -face_1.x,
    };
    bdy.indicator_info = { 1: face_1, [-1]: face_2 };
  });

  frame.itr?.forEach(itr => {
    const face_1 = {
      tex: 0, pw: 0, ph: 0,
      cx: 0, cy: 0,
      w: itr.w / cell_w,
      h: itr.h / cell_h,
      x: itr.x / cell_w - f_i_1.cx,
      y: 1 - (itr.y + itr.h) / cell_h,
    };
    const face_2 = {
      ...face_1, cx: 1,
      x: -itr.x / cell_w + f_i_1.cx,
    };
    itr.indicator_info = { 1: face_1, [-1]: face_2 };
  });

};

const cook_frame_hit = (frame: IFrameInfo) => {
  const hit = frame.hit;
  if (!hit) return;

  hit.sequences && traversal(hit.sequences, (k, v) => v && preprocess_next_frame(v));

  hit && get_keys(hit).forEach(k => {
    if (k === 'sequences') return;
    const v = hit[k];
    v && preprocess_next_frame(v);
  });
}


function cook_frame_hold(frame: IFrameInfo) {
  const hold = frame.hold;
  hold && get_keys(hold).forEach(k => {
    const v = hold[k];
    if (v) preprocess_next_frame(v);
  });
}

