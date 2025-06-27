import { Warn } from "../../Log";
import LF2 from "../LF2";
import { cook_frame_indicator_info } from "../dat_translator/cook_frame_indicator_info";
import { IFrameInfo, ITexturePieceInfo } from "../defines";
import { IEntityData } from "../defines/IEntityData";
import { IPictureInfo } from "../defines/IPictureInfo";
import read_nums from "../layout/utils/read_nums";
import { traversal } from "../utils/container_help/traversal";
import { preprocess_bdy } from "./preprocess_bdy";
import { preprocess_itr } from "./preprocess_itr";
import { preprocess_next_frame } from "./preprocess_next_frame";

export function preprocess_frame(lf2: LF2, data: IEntityData, frame: IFrameInfo) {
  cook_frame_indicator_info(frame);
  if (frame.sound && !lf2.sounds.has(frame.sound))
    lf2.sounds.load(frame.sound, frame.sound);

  const { hold = {}, hit = {} } = frame;
  traversal(hit.sequences ?? {}, (_, v) => { if (v) preprocess_next_frame(v) });
  traversal(hit, (k, v) => {
    if (k !== 'sequences' && v) preprocess_next_frame(v)
  })
  traversal(hold, (_, v) => { if (v) preprocess_next_frame(v) })

  if (frame.next) preprocess_next_frame(frame.next);
  if (frame.on_dead) preprocess_next_frame(frame.on_dead);
  if (frame.on_exhaustion) preprocess_next_frame(frame.on_exhaustion);
  if (frame.on_landing) preprocess_next_frame(frame.on_landing);

  frame.bdy?.forEach((n, i, l) => l[i] = preprocess_bdy(n, data))
  frame.itr?.forEach((n, i, l) => l[i] = preprocess_itr(n, data))

  const unchecked_frame = frame as any;
  if (unchecked_frame) {
    if (unchecked_frame.center) {
      const [x, y] = read_nums(unchecked_frame.center, 2, [
        frame.centerx ?? 0,
        frame.centery ?? 0,
      ]);
      frame.centerx = x;
      frame.centery = y;
    }
  }
  let pic = frame.pic;
  let pic_info: IPictureInfo | undefined = void 0;
  if (pic && !("1" in pic)) {
    for (const key in data.base.files) {
      if (data.base.files[key].id === pic.tex) {
        pic_info = data.base.files[key];
        break;
      }
    }
    if (pic_info === void 0)
      return Warn.print(
        preprocess_frame.TAG,
        "file info not found, pic number:",
        pic,
      );
    const p = lf2.images.find_by_pic_info(pic_info);
    if (!p) return Warn.print(preprocess_frame.TAG, "image_info not found", pic_info);

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
      x: -f_i_1.x - f_i_1.w,
    };
    frame.pic = {
      ...pic,
      1: f_i_1,
      [-1]: f_i_2,
    };
  }
}
preprocess_frame.TAG = "preprocess_frame";

