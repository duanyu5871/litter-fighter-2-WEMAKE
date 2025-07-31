import Ditto from "../ditto";
import { LF2 } from "../LF2";
import { is_str } from "../utils";
import { ICookedUIInfo } from "./ICookedUIInfo";
import { IUIImgInfo } from "./IUIImgInfo.dat";
import type { IUIInfo, TUIImgInfo } from "./IUIInfo.dat";
import { ui_load_img } from "./ui_load_img";
import { ui_load_txt } from "./ui_load_txt";
import { UINode } from "./UINode";
import read_nums from "./utils/read_nums";
import { validate_ui_img_info } from "./validate_ui_img_info";
export function flat_ui_img_info(imgs: TUIImgInfo[], output?: IUIImgInfo[]): IUIImgInfo[] {
  const ret: IUIImgInfo[] = [];
  for (let img of imgs) {
    const errors: string[] = [];
    img = typeof img === 'string' ? { path: img } : img;
    validate_ui_img_info(img, errors);
    if (errors.length) throw new Error(errors.join('\n'));
    const { x = 0, y = 0, w = 0, h = 0, col: cols = 1, row: rows = 1, count = 0 } = img;
    let idx = 0;
    for (let row = 0; row < rows && (count <= 0 || idx < count); ++row) {
      for (let col = 0; col < cols && (count <= 0 || idx < count); ++col) {
        const i = { ...img, x: x + col * w, y: y + row * h }
        ret.push(i);
        output?.push(i)
        ++idx;
      }
    }
  }
  return ret;
};
async function read_ui_template(lf2: LF2, raw_info: IUIInfo, parent: ICookedUIInfo | undefined): Promise<IUIInfo> {
  const { template: template_name, ...remain_raw_info } = raw_info
  if (!template_name) return raw_info;
  let raw_template: IUIInfo | undefined = void 0;
  let n = parent;
  while (n && !raw_template) {
    raw_template = n.templates?.[template_name];
    n = n.parent;
  }
  raw_template = raw_template || await lf2.import_json<IUIInfo>(template_name);
  Object.assign(raw_template, remain_raw_info);
  return { ...raw_template, ...remain_raw_info };
}
export async function cook_ui_info(
  lf2: LF2,
  data_or_path: IUIInfo | string,
  parent?: ICookedUIInfo
): Promise<ICookedUIInfo> {
  let raw_info = is_str(data_or_path)
    ? await lf2.import_json<IUIInfo>(data_or_path)
    : data_or_path;

  if (raw_info.template) raw_info = await read_ui_template(lf2, raw_info, parent);
  const id = raw_info.id || 'no_id_' + Date.now();
  const name = raw_info.name || 'no_name_' + Date.now();
  const ret: ICookedUIInfo = {
    ...raw_info,
    id, name,
    pos: read_nums(raw_info.pos, 3, [0, 0, 0]),
    scale: read_nums(raw_info.scale, 3, [1, 1, 1]),
    center: read_nums(raw_info.center, 3, [0, 0, 0]),
    size: [0, 0],
    parent,
    img_infos: [],
    txt_infos: [],
    items: void 0,
    templates: void 0,
    img: [],
    txt: []
  };

  if (raw_info.templates) {
    for (const key in raw_info.templates) {
      const template = raw_info.templates[key];
      if (!template) continue;
      if (!ret.templates) ret.templates = {};
      ret.templates[key] = await cook_ui_info(lf2, template, parent);
    }
  }

  const { img } = raw_info;
  if (img) ret.img_infos.push(...await ui_load_img(lf2, img, ret.img));

  const { txt } = raw_info;
  if (txt) ret.txt_infos.push(...await ui_load_txt(lf2, txt, ret.txt));

  const { w: img_w = 0, h: img_h = 0, scale = 1 } = ret.img_infos[0] || ret.txt_infos[0] || {};
  const sw = img_w / scale;
  const sh = img_h / scale;
  const [w, h] = read_nums(raw_info.size, 2, [parent ? sw : lf2.world.screen_w, parent ? sh : lf2.world.screen_h]);
  // 宽或高其一为0时，使用原图宽高比例的计算之
  const dw = Math.floor(w ? w : sh ? (h * sw / sh) : 0);
  const dh = Math.floor(h ? h : sw ? (w * sh / sw) : 0);
  ret.size = [dw, dh];

  const { items } = raw_info;
  if (items && !Array.isArray(items)) {
    Ditto.Warn(`[${UINode.TAG}::cook_ui_info] items must be array, but got`, items);
  }
  if (Array.isArray(items) && items.length) {
    ret.items = [];
    for (const item of items)
      ret.items.push(await cook_ui_info(lf2, item, ret));
  } else {
    delete ret.items;
  }
  return ret;
}