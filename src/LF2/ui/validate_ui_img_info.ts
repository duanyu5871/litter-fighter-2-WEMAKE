import { is_non_blank_str, is_non_nagative_int, is_positive_int } from "../utils";
import { IUIImgInfo } from "./IUIImgInfo.dat";

export function validate_ui_img_info(any: any, errors: string[] = [], warnings: string[] = []): any is IUIImgInfo {
  const fn = 'validate_ui_img_info';
  if (typeof any !== 'object') { errors.push(`${fn}] must be an object, but got ${any}`); return false; }
  let ret = true;
  const v = any as IUIImgInfo;
  if (!is_non_blank_str(v.path)) { ret = false; errors.push(`[${fn}]path must be a non-blank string, but got ${v.path}`); }
  if ('x' in v && !is_non_nagative_int(v.x)) { ret = false; errors.push(`[${fn}]x must be a non-negative integer or undefiend, but got ${v.x}`); }
  if ('y' in v && !is_non_nagative_int(v.y)) { ret = false; errors.push(`[${fn}]y must be a non-negative integer or undefiend, but got ${v.y}`); }
  if ('w' in v && !is_positive_int(v.w)) { ret = false; errors.push(`[${fn}]w must be a positive integer or undefiend, but got ${v.w}`); }
  if ('h' in v && !is_positive_int(v.h)) { ret = false; errors.push(`[${fn}]h must be a positive integer or undefiend, but got ${v.h}`); }
  if ('dw' in v && !is_positive_int(v.dw)) { ret = false; errors.push(`[${fn}]dw must be a positive integer or undefiend, but got ${v.dw}`); }
  if ('dh' in v && !is_positive_int(v.dh)) { ret = false; errors.push(`[${fn}]dh must be a positive integer or undefiend, but got ${v.dh}`); }
  if ('col' in v && !is_positive_int(v.col)) { ret = false; errors.push(`[${fn}]col must be a positive integer or undefiend, but got ${v.col}`); }
  if ('row' in v && !is_positive_int(v.row)) { ret = false; errors.push(`[${fn}]row must be a positive integer or undefiend, but got ${v.row}`); }
  if ('col' in v !== 'row' in v) { ret = false; errors.push(`[${fn}]col, row should both be set!`); }
  if (('col' in v || 'row' in v) && !('w' in v) || !('h' in v)) { ret = false; errors.push(`[${fn}]w and h are required when col and row are set!`); }
  if ('count' in v && !is_positive_int(v.count)) { ret = false; errors.push(`[${fn}]count must be a positive integer or undefiend, but got ${v.count}`); }
  return ret;
}
validate_ui_img_info.TAG = 'validate_ui_img_info'