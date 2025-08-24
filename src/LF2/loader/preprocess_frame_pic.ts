import { IEntityData, IFrameInfo, IFramePictureInfo, ITexturePieceInfo } from "../defines";
import Ditto from "../ditto";
import { LF2 } from "../LF2";
import { find } from "../utils";
import { ImageInfo } from "./ImageInfo";

const cache_key = (a: IFramePictureInfo, b: ImageInfo): string => {
  return [a.tex, a.x, a.y, a.w, a.h, b.w, b.h, b.scale].join();
}
const cache_map = new Map<string, IFramePictureInfo>();
export function preprocess_frame_pic(lf2: LF2, data: IEntityData, frame: IFrameInfo): IFramePictureInfo | undefined {
  const { pic } = frame;
  if (!pic) return pic;

  const pic_info = find(data.base.files, ([,v]) => v.id === pic.tex)?.[1];
  if (!pic_info) {
    Ditto.Warn(preprocess_frame_pic.TAG, "file info not found, pic:", pic);
    return pic;
  }
  const p = lf2.images.find_by_pic_info(pic_info);
  if (!p) {
    Ditto.Warn(preprocess_frame_pic.TAG, "img info not found", pic_info);
    return pic;
  };
  const ck = cache_key(pic, p)
  let ret = cache_map.get(ck);
  if (ret) return ret;
  
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
    ...f_i_1, x: -f_i_1.x - f_i_1.w,
  };
  ret = { ...pic, 1: f_i_1, [-1]: f_i_2 };
  cache_map.set(ck, ret)

  return ret;
}

preprocess_frame_pic.TAG = "preprocess_frame_pic"