import { Warn } from '../../Log';
import LF2 from '../LF2';
import { IEntityData, IEntityPictureInfo, IFrameInfo, ITexturePieceInfo } from '../defines';
import read_nums from '../layout/utils/read_nums';
import { traversal } from '../utils/container_help/traversal';
import { cook_next_frame } from './preprocess_next_frame';
const get_keys = <V extends {}>(v: V): (keyof V)[] => {
  return Object.keys(v) as (keyof V)[]
}
export function cook_frame(lf2: LF2, data: IEntityData, frame: IFrameInfo) {
  if (frame.sound && !lf2.sounds.has(frame.sound))
    lf2.sounds.load(frame.sound, frame.sound);

  const { hold, hit } = frame;
  if (hit) {
    hit.sequences && traversal(hit.sequences, (_, v) => v && cook_next_frame(v));
    hit && get_keys(hit).forEach(k => {
      if (k !== 'sequences') {
        hit[k] && cook_next_frame(hit[k]);
      }
    });
  }

  if (hold) {
    get_keys(hold).forEach(k => {
      hold[k] && cook_next_frame(hold[k]);
    });
  }

  if (frame.next) cook_next_frame(frame.next);
  if (frame.on_dead) cook_next_frame(frame.on_dead);
  if (frame.on_exhaustion) cook_next_frame(frame.on_exhaustion);
  if (frame.on_landing) cook_next_frame(frame.on_landing);

  if (frame.bdy?.length) {
    for (let i = 0; i < frame.bdy.length; ++i) {
      let bdy = frame.bdy[i];
      const prefab = bdy.prefab_id !== void 0 ? data.bdy_prefabs?.[bdy.prefab_id] : void 0;
      if (prefab) bdy = frame.bdy[i] = { ...prefab, ...bdy };
      if (bdy.break_act) cook_next_frame(bdy.break_act);
      if (bdy.hit_act) cook_next_frame(bdy.hit_act);
    }
  }
  if (frame.itr?.length) {
    for (let i = 0; i < frame.itr.length; ++i) {
      let itr = frame.itr[i];
      const prefab = itr.prefab_id !== void 0 ? data.itr_prefabs?.[itr.prefab_id] : void 0;
      if (prefab) itr = frame.itr[i] = { ...prefab, ...itr };

      if (itr.hit_act) cook_next_frame(itr.hit_act);
      if (itr.catchingact) cook_next_frame(itr.catchingact);
      if (itr.caughtact) cook_next_frame(itr.caughtact);
    }
  }

  const unchecked_frame = (frame as any);
  if (unchecked_frame) {
    if (unchecked_frame.center) {
      const [x, y] = read_nums(unchecked_frame.center, 2, [frame.centerx ?? 0, frame.centery ?? 0]);
      frame.centerx = x;
      frame.centery = y;
    }
  }
  let pic = frame.pic;
  let pic_info: IEntityPictureInfo | undefined = void 0;
  if (pic && !('1' in pic)) {
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
      pixel_w: pic.w,
      pixel_h: pic.h,
    };
    const f_i_2: ITexturePieceInfo = {
      ...f_i_1,
      x: -f_i_1.x - f_i_1.w
    };
    frame.pic = {
      ...pic,
      1: f_i_1,
      [-1]: f_i_2,
    };
  }
}
cook_frame.TAG = 'cook_frame'