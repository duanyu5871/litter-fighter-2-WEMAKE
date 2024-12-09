import { Warn } from '../../Log';
import LF2 from '../LF2';
import { IEntityPictureInfo, IFrameInfo, IGameObjData, ITexturePieceInfo } from '../defines';
import read_nums from '../layout/utils/read_nums';
import { traversal } from '../utils/container_help/traversal';
import { cook_next_frame } from './preprocess_next_frame';
const get_keys = <V extends {}>(v: V): (keyof V)[] => {
  return Object.keys(v) as (keyof V)[]
}
export const cook_frame = (lf2: LF2, data: IGameObjData, frame: IFrameInfo) => {
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

