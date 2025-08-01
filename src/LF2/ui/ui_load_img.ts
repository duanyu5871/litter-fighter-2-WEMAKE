import { LF2 } from "../LF2";
import { is_arr } from "../utils";
import { flat_ui_img_info } from "./cook_ui_info";
import { IUIImgInfo } from "./IUIImgInfo.dat";
import type { TUIImgInfo } from "./IUIInfo.dat";

export async function ui_load_img(lf2: LF2, img: TUIImgInfo | TUIImgInfo[], output?: IUIImgInfo[]) {
  const imgs = flat_ui_img_info(is_arr(img) ? img : [img], output);
  return await Promise.all(
    imgs.map(img => {
      const { path, x, y, w = 0, h = 0, dw = w, dh = h } = img;
      const img_key = `${path}?x=${x}&y=${y}&w=${w}&h=${h}&dw=${dw}&dh=${dh}`;
      return lf2.images.load_img(img_key, path, [{ type: 'crop', ...img }]);
    })
  );
}
