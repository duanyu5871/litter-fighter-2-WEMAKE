import { is_str } from '../is_str';
import { IDatIndex } from '../lf2_type';
import { IBgData } from "../lf2_type/IBgData";
import { IBgLayerInfo } from "../lf2_type/IBgLayerInfo";
import { Defines } from '../lf2_type/defines';
import { match_colon_value } from '../match_colon_value';
import { take_blocks } from '../take_blocks';
import { to_num } from '../to_num';
import { ColonValueReader } from './ColonValueReader';
import { take } from './take';
const bg_color_translate = function (rect: number | string) {
  switch ('' + rect) {
    case '4706': return 'rgb(16,79,16)';
    case '16835': return 'rgb(66,56,24)';
    case '21096': return 'rgb(90,78,75)';
    case '25356': return 'rgb(103,103,103)';
    case '29582': return 'rgb(119,119,119)';
    case '33580': return 'rgb(135,107,103)';
    case '37770': return 'rgb(154,110,90)';
    case '37773': return 'rgb(151,119,111)';
    case '34816': return 'rgb(143,7,7)';
    case '40179':
    case '40179b': return 'rgb(159,163,159)';
  }
  if (is_str(rect)) return rect;
  const r = (rect >> 11) << 3;
  const g = ((rect >> 6) & 31) << 3;
  const b = (rect & 31) << 3
  return 'rgb(' +
    (r + (r > 64 || r === 0 ? 7 : 0)) + ',' +
    (g + (g > 64 || g === 0 ? 7 : 0) + (((rect >> 5) & 1) && g > 80 ? 4 : 0)) + ',' +
    (b + (b > 64 || b === 0 ? 7 : 0)) +
    ')'
};
export function make_bg_data(full_str: string, datIndex?: IDatIndex): IBgData | void {
  const fields = new ColonValueReader()
    .str('name')
    .num('width')
    .num_2('zboundary')
    .str('shadow')
    .num_2('shadowsize')
    .read(full_str);

  const width = take(fields, 'width');
  const [a, b] = take(fields, 'zboundary');
  fields.left = 0;
  fields.right = width;
  fields.far = 2 * (a - Defines.OLD_SCREEN_HEIGHT);
  fields.near = 2 * (b - Defines.OLD_SCREEN_HEIGHT);

  const ret: IBgData = {
    type: 'background',
    id: datIndex?.id ?? fields.name,
    base: fields,
    layers: []
  };
  const blocks = take_blocks(full_str, 'layer:', 'layer_end', v => full_str = v);
  let min_y = Defines.OLD_SCREEN_HEIGHT;
  for (const block_str of blocks) {
    const [file, remains] = block_str.trim().split(/\n|\r/g).filter(v => v).map(v => v.trim());
    const fields: any = {};
    for (const [key, value] of match_colon_value(remains)) {
      fields[key] = to_num(value);
    }
    take(fields, 'transparency')
    const y = take(fields, 'y')
    const cc = take(fields, 'cc');
    const c1 = take(fields, 'c1');
    const c2 = take(fields, 'c2');
    const color = take(fields, 'rect')
    const layer: IBgLayerInfo = {
      ...fields,
      file,
      y: Defines.OLD_SCREEN_HEIGHT - y,
      z: ret.layers.length - blocks.length,
    };
    min_y = Math.min(layer.y, min_y)
    if (color) {
      layer.absolute = 1;
      layer.color = bg_color_translate(color);
      delete layer.file;
    } else if (
      typeof cc === 'number' &&
      typeof c1 === 'number' &&
      typeof c2 === 'number'
    ) {
      layer.cc = cc * 2;
      layer.c1 = c1 * 2;
      layer.c2 = c2 * 2 + 1;
    }
    ret.layers.push(layer);
  }
  return ret;
}
