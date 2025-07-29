import { is_non_blank_str, is_non_nagative_int, is_positive_int } from "../utils";
import { IUIImgInfo } from "./IUIImgInfo";

export function validate_ui_img_info(any: any, errors: string[] = []): any is IUIImgInfo {
  const fn = 'validate_ui_img_info';
  if (typeof any !== 'object') { errors.push(`${fn}] must be an object, but got ${any}`); return false; }
  let ret = true;
  const v = any as IUIImgInfo;
  if (!is_non_blank_str(v.path)) { ret = false; errors.push(`[${fn}]path must be a non-blank string, but got ${v.path}`); }
  if ('x' in v && !is_non_nagative_int(v.x)) { ret = false; errors.push(`[${fn}]x must be a non-negative integer or undefiend, but got ${v.x}`); }
  if ('y' in v && !is_non_nagative_int(v.y)) { ret = false; errors.push(`[${fn}]y must be a non-negative integer or undefiend, but got ${v.y}`); }
  if (!is_positive_int(v.w)) { ret = false; errors.push(`[${fn}]w must be a positive integer, but got ${v.w}`); }
  if (!is_positive_int(v.h)) { ret = false; errors.push(`[${fn}]h must be a positive integer, but got ${v.h}`); }
  if ('dw' in v && !is_positive_int(v.dw)) { ret = false; errors.push(`[${fn}]dw must be a positive integer or undefiend, but got ${v.dw}`); }
  if ('dh' in v && !is_positive_int(v.dh)) { ret = false; errors.push(`[${fn}]dh must be a positive integer or undefiend, but got ${v.dh}`); }
  return ret;
}
validate_ui_img_info.TAG = 'validate_ui_img_info'