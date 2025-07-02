import type { IBgData } from "../defines";
import type LF2 from "../LF2";
import { not_blank_str } from "../utils/type_check/is_str";
import type { ImageInfo } from "./ImageInfo";

export function preprocess_bg_data(lf2: LF2, data: IBgData, jobs: Promise<ImageInfo>[]): IBgData {
  const { layers, base: { shadow } } = data;
  not_blank_str(shadow) && jobs.push(lf2.images.load_img(shadow, shadow));
  for (const { file } of layers)
    not_blank_str(file) && jobs.push(lf2.images.load_img(file, file));
  return data
}
preprocess_bg_data.TAG = "preprocess_bg_data"