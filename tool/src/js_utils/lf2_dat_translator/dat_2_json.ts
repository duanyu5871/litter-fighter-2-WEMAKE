import { IBaseData, IBgData, ICharacterInfo, IDatIndex, IGameObjInfo, IBallFrameInfo, IBallInfo, IWeaponInfo } from '../lf2_type';
import { IBgLayerInfo } from "../lf2_type/IBgLayerInfo";
import { match_block_once } from '../match_block';
import { match_colon_value } from '../match_colon_value';
import { set_obj_field } from "../set_obj_field";
import { take_blocks } from '../take_blocks';
import { to_num } from '../to_num';
import { ColonValueReader } from './ColonValueReader';
import { make_character_data } from './make_character_data';
import { make_entity_data } from './make_entity_data';
import { make_frames } from './make_frames';
import { make_ball_data } from './make_ball_data';
import { make_weapon_data } from './make_weapon_data';
import { take } from './take';

const bg_color_translate = function (c: number) {
  let b = ((c & 0xff0000) >> 16).toString(16);
  let r = ((c & 0xff00) >> 8).toString(16);
  let g = ((c & 0xff)).toString(16);
  let ret = '0x';
  ret += r.length === 1 ? ('0' + r) : r.length === 0 ? '00' : r;
  ret += g.length === 1 ? ('0' + g) : g.length === 0 ? '00' : g;
  ret += b.length === 1 ? ('0' + b) : b.length === 0 ? '00' : b;
  return Number(ret);
}

function read_bg(full_str: string, datIndex?: IDatIndex): IBgData | void {
  const fields = new ColonValueReader()
    .str('name')
    .num('width')
    .num_2('zboundary')
    .str('shadow')
    .num_2('shadowsize')
    .read(full_str);
  const ret: IBgData = {
    type: 'background',
    id: '',
    base: fields,
    layers: []
  }
  for (const block_str of take_blocks(full_str, 'layer:', 'layer_end', v => full_str = v)) {
    const [file, remains] = block_str.trim().split(/\n|\r/g).filter(v => v).map(v => v.trim());
    const fields: any = {};
    for (const [key, value] of match_colon_value(remains)) {
      fields[key] = to_num(value);
    }
    const color = take(fields, 'rect')
    const layer: IBgLayerInfo = { file, ...fields };
    if (layer.file === ret.base.shadow) delete layer.file;
    if (typeof color === 'number') layer.color = bg_color_translate(color);
    ret.layers.push(layer)
  }
  if (datIndex?.id) ret.id = datIndex?.id
  return ret;
}
export default function dat_to_json(full_str: string, datIndex?: IDatIndex): IBaseData | void {
  const infos_str = match_block_once(full_str, '<bmp_begin>', '<bmp_end>');
  if (!infos_str) {
    return read_bg(full_str, datIndex);
  }
  const base: any = {};
  for (const info_str of infos_str.trim().split('\n')) {
    let reg_result;
    reg_result = info_str.match(/name:\s*(\S*)/);
    if (reg_result) { base.name = reg_result[1]; continue; }
    reg_result = info_str.match(/head:\s*(\S*)/);
    if (reg_result) { base.head = reg_result[1]; continue; }
    reg_result = info_str.match(/small:\s*(\S*)/);
    if (reg_result) { base.small = reg_result[1]; continue; }
    if (info_str.startsWith('file(')) {
      const file_id = base.files ? Object.keys(base.files).length : 0
      const file: any = { id: file_id };
      for (const [key, value] of match_colon_value(info_str)) {
        if (key.startsWith('file')) {
          const [, begin, end] = key.match(/file\((\d+)-(\d+)\)/)!
          file.path = value;
          file.begin = Number(begin);
          file.end = Number(end);
        } else {
          file[key] = Number(value);
        }
      }
      base.files = set_obj_field(base.files, '' + file_id, file)
      continue;
    }

    reg_result = info_str.match(/(\S*)\s*:\s*([+-]?([0-9]*[.])?[0-9]+)/);
    if (reg_result) {
      (base as any)[reg_result[1] as any] = Number(reg_result[2]);
      continue;
    }

    // reading field like: `name: value`;
    reg_result = info_str.match(/(\S*)\s*:\s*(\S*)/);
    if (reg_result) {
      (base as any)[reg_result[1] as any] = reg_result[2];
      continue;
    }

    // reading field like: `name 10086.00`;
    reg_result = info_str.match(/(\S*)\s*([+-]?([0-9]*[.])?[0-9]+)/);
    if (reg_result) {
      (base as any)[reg_result[1] as any] = Number(reg_result[2]);
      continue;
    }

    // reading field like: `name value`;
    reg_result = info_str.match(/(\S*)\s*(\S*)/);
    if (reg_result) {
      (base as any)[reg_result[1] as any] = reg_result[2];
      continue;
    }
  }

  if (datIndex) {
    let ret: IBaseData | undefined = void 0;
    switch (datIndex.type) {
      case 1:
      case 2:
      case 4:
      case 6:
        ret = make_weapon_data(base as IWeaponInfo, full_str, make_frames(full_str));
        break;
      case 0: ret = make_character_data(base as ICharacterInfo, make_frames(full_str)); break;
      case 3: ret = make_ball_data(base as IBallInfo, make_frames<IBallFrameInfo>(full_str), datIndex); break;
      case 5: ret = make_entity_data(base as IGameObjInfo, make_frames(full_str)); break;
      default:
        console.log('[dat_to_json] unknow dat type:', datIndex.type)
        ret = make_entity_data(base as IGameObjInfo, make_frames(full_str));
        break;
    }
    if (ret) ret.id = datIndex.id;
    return ret;
  } else {
    if ('small' in base && 'name' in base && 'head' in base)
      return make_character_data(base as ICharacterInfo, make_frames(full_str))
    if ('weapon_hp' in base)
      return make_weapon_data(base as IWeaponInfo, full_str, make_frames(full_str));
    if ('weapon_hit_sound' in base)
      return make_ball_data(base as IBallInfo, make_frames<IBallFrameInfo>(full_str));
    return make_entity_data(base as IGameObjInfo, make_frames(full_str));
  }
}