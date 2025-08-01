import { clamp, is_num, is_str } from "../../utils";

/**
 * 从颜色字符串或颜色整型中获取透明度
 *
 * @export
 * @param {(number | string | undefined | null)} raw 颜色
 *    支持字符串格式: 
 *      - rgba(0, 0, 0, 0.1)  ----> 0.1
 *      - argb(0.1, 0, 0, 0)    ----> 0.1
 *      - #000000FF           ----> 1
 *      - 0x000000FF ----> 1
 * @return  {(number | null)} 当透明度读取成功，返回0~1的数字，否则返回null
 */
export function get_alpha_from_color(raw: number | string | undefined | null): number | null {
  if (void 0 === raw || null === raw) return null;
  if (is_str(raw)) {
    const color = raw.trim();
    if (!color) return null;
    if ("transparent" === color) return 0;
    let n = Number(color.match(/^rgba\(.*,.*,.*,(.*)\)$/)?.[1]);
    if (is_num(n)) return clamp(n, 0, 1);
    n = Number(color.match(/^argb\((.*),.*,.*,.*\)$/)?.[1]);
    if (is_num(n)) return clamp(n, 0, 1);
    n = Number('0x' + color.match(/^#\S\S\S\S\S\S(\S\S)$/)?.[1]) / 255;
    if (is_num(n)) return clamp(n, 0, 1);
    n = Number('0x' + color.match(/^0[x|X]\S\S\S\S\S\S(\S\S)$/)?.[1]) / 255;
    if (is_num(n)) return clamp(n, 0, 1);
    raw = Number(color.match(/^(\d+)$/)?.[1]);
  }
  if (!Number.isInteger(raw) || raw < 0) return null;
  return clamp((raw >>> 24) / 255, 0, 1);
}
