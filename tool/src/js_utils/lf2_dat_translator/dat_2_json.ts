import { IBaseData, IDatIndex, IGameObjInfo } from '../lf2_type';
import { IBallFrameInfo } from "../lf2_type/IBallFrameInfo";
import { IBallInfo } from "../lf2_type/IBallInfo";
import { ICharacterInfo } from "../lf2_type/ICharacterInfo";
import { IWeaponInfo } from "../lf2_type/IWeaponInfo";
import { Defines } from '../lf2_type/defines';
import { match_block_once } from '../match_block';
import { match_colon_value } from '../match_colon_value';
import { set_obj_field } from "../set_obj_field";
import { data_to_stage_jsons as make_stage_infos } from './data_to_stage_jsons';
import { make_ball_data } from './make_ball_data';
import { make_bg_data } from './make_bg_data';
import { make_character_data } from './make_character_data';
import { make_entity_data } from './make_entity_data';
import { make_frames } from './make_frames';
import { make_weapon_data } from './make_weapon_data';
export default function dat_to_json(full_str: string, datIndex?: IDatIndex): any | void {
  if (full_str.startsWith('<stage>')) return make_stage_infos(full_str);
  if (full_str.startsWith('name:')) return make_bg_data(full_str, datIndex);
  const infos_str = match_block_once(full_str, '<bmp_begin>', '<bmp_end>');
  if (!infos_str) { return; }
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
        base.type = {
          '120': Defines.WeaponType.Stick, // Knife
          '124': Defines.WeaponType.Stick, // Boomerang
        }['' + datIndex.id] ?? Defines.WeaponType.Stick
        base.bounce = 0.2;
        base.name = datIndex.hash ?? datIndex.file.replace(/[^a-z|A-Z|0-9|_]/g, '')
        ret = make_weapon_data(base, full_str, make_frames(full_str));
        break;
      case 2:
        base.type = Defines.WeaponType.Heavy;
        switch (datIndex.id) {
          case 150: base.bounce = 0.2; break;
          default: base.bounce = 0.1; break;
        }
        base.name = datIndex.hash ?? datIndex.file.replace(/[^a-z|A-Z|0-9|_]/g, '')
        ret = make_weapon_data(base, full_str, make_frames(full_str));
        break;
      case 4:
        base.type = Defines.WeaponType.Baseball;
        base.bounce = 0.45;
        base.name = datIndex.hash ?? datIndex.file.replace(/[^a-z|A-Z|0-9|_]/g, '')
        ret = make_weapon_data(base, full_str, make_frames(full_str));
        break;
      case 6: {
        base.type = Defines.WeaponType.Drink;
        base.bounce = 0.4;
        base.name = datIndex.hash ?? datIndex.file.replace(/[^a-z|A-Z|0-9|_]/g, '')
        ret = make_weapon_data(base, full_str, make_frames(full_str));
        break;
      }
      case 0: ret = make_character_data(base as ICharacterInfo, make_frames(full_str)); break;
      case 3: ret = make_ball_data(base as IBallInfo, make_frames<IBallFrameInfo>(full_str), datIndex); break;
      case 5: ret = make_entity_data(base as IGameObjInfo, make_frames(full_str)); break;
      default:
        console.warn('[dat_to_json] unknow dat type:', datIndex.type)
        ret = make_entity_data(base as IGameObjInfo, make_frames(full_str));
        break;
    }
    if (ret) ret.id = datIndex.id;
    return ret;
  } else {
    if ('small' in base && 'name' in base && 'head' in base)
      return make_character_data(base as ICharacterInfo, make_frames(full_str))
    if ('weapon_hp' in base) {
      const info = base as IWeaponInfo;
      return make_weapon_data(info, full_str, make_frames(full_str));
    }
    if ('weapon_hit_sound' in base)
      return make_ball_data(base as IBallInfo, make_frames<IBallFrameInfo>(full_str));
    return make_entity_data(base as IGameObjInfo, make_frames(full_str));
  }
}