import {
  IBallData, IBaseData, IBgData, ICharacterData,
  IEntityData, IEntityPictureInfo, IGameObjInfo, IStageInfo,
  IWeaponData
} from '../defines';
import { IBallFrameInfo } from "../defines/IBallFrameInfo";
import { IBallInfo } from "../defines/IBallInfo";
import { ICharacterInfo } from "../defines/ICharacterInfo";
import { IDatIndex } from "../defines/IDatIndex";
import { IWeaponInfo } from "../defines/IWeaponInfo";
import { Defines } from '../defines/defines';
import { set_obj_field } from "../utils/container_help/set_obj_field";
import { match_block_once } from '../utils/string_parser/match_block';
import { match_colon_value } from '../utils/string_parser/match_colon_value';
import { cook_louis_data, cook_rudolf_data } from './cook_louis_data';
import { make_ball_data } from './make_ball_data';
import { make_bg_data } from './make_bg_data';
import { make_character_data } from './make_character_data';
import { make_entity_data } from './make_entity_data';
import { make_frames } from './make_frames';
import { make_stage_info_list as make_stage_infos } from './make_stage_info_list';
import { make_weapon_brokens, make_weapon_data } from './make_weapon_data';

export default function dat_to_json(
  full_str: string, datIndex?: IDatIndex
): void | IStageInfo[] | IEntityData | IBallData | IBgData | ICharacterData | IWeaponData | IBaseData {
  full_str = full_str.replace(/\\\\/g, '/');
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
    if (reg_result) { base.head = reg_result[1].replace(/.bmp$/, '.png'); continue; }
    reg_result = info_str.match(/small:\s*(\S*)/);
    if (reg_result) { base.small = reg_result[1].replace(/.bmp$/, '.png'); continue; }
    if (info_str.startsWith('file(')) {
      const file_id = base.files ? Object.keys(base.files).length : 0
      const file: IEntityPictureInfo = {
        id: '' + file_id,
        path: '',
        row: 0,
        col: 0,
        cell_w: 0,
        cell_h: 0
      };
      for (const [key, value] of match_colon_value(info_str)) {
        if (key.startsWith('file')) {
          file.path = value.replace(/.bmp$/, '.png');
        } else if (key === 'w') {
          file.cell_w = Number(value)
        } else if (key === 'h') {
          file.cell_h = Number(value)
        } else {
          (file as any)[key] = Number(value);
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
    switch ('' + datIndex.type) {
      case '1':
        base.type = {
          '120': Defines.WeaponType.Knife, // Knife
          '124': Defines.WeaponType.Knife, // Boomerang
        }['' + datIndex.id] ?? Defines.WeaponType.Stick
        base.bounce = 0.2;
        base.name = datIndex.hash ?? datIndex.file.replace(/[^a-z|A-Z|0-9|_]/g, '')
        ret = make_weapon_data(base, full_str, make_frames(full_str, base.files));
        make_weapon_brokens(ret as any)
        break;
      case '2':
        base.type = Defines.WeaponType.Heavy;
        switch (datIndex.id) {
          case '150': base.bounce = 0.2; break;
          default: base.bounce = 0.1; break;
        }
        base.name = datIndex.hash ?? datIndex.file.replace(/[^a-z|A-Z|0-9|_]/g, '')
        ret = make_weapon_data(base, full_str, make_frames(full_str, base.files));
        make_weapon_brokens(ret as any)
        break;
      case '4':
        base.type = Defines.WeaponType.Baseball;
        base.bounce = 0.45;
        base.name = datIndex.hash ?? datIndex.file.replace(/[^a-z|A-Z|0-9|_]/g, '')
        ret = make_weapon_data(base, full_str, make_frames(full_str, base.files));
        make_weapon_brokens(ret as any)
        break;
      case '6': {
        base.type = Defines.WeaponType.Drink;
        base.bounce = 0.4;
        base.name = datIndex.hash ?? datIndex.file.replace(/[^a-z|A-Z|0-9|_]/g, '')
        ret = make_weapon_data(base, full_str, make_frames(full_str, base.files));
        make_weapon_brokens(ret as any)
        break;
      }
      case '0': {
        const info = base as ICharacterInfo;
        const num_id = Number(datIndex.id);
        const add_group = (info: ICharacterInfo, group: string) => {
          info.group = info.group || [];
          if (info.group.indexOf(group) < 0) info.group.push(group)
        }
        if ((num_id >= 30 && num_id <= 39) || (num_id >= 50 && num_id <= 59)) {
          add_group(info, Defines.EntityGroup.Hidden)
        }
        if (num_id >= 1 && num_id <= 29) {
          add_group(info, Defines.EntityGroup.Regular)
        }
        if (datIndex.id === '52') {
          info.ce = 3;
          info.armor = {
            fireproof: 1,
            antifreeze: 1,
            hit_sound: 'data/002.wav.mp3',
            type: 'times',
            toughness: 3,
          }
        } else if (datIndex.id === '51') {
          info.ce = 2;
        } else if (datIndex.id === '37') {
          info.armor = {
            hit_sound: 'data/085.wav.mp3',
            type: 'times',
            toughness: 3,
          }
        } else if (datIndex.id === '6') {
          info.armor = {
            hit_sound: 'data/085.wav.mp3',
            type: 'times',
            toughness: 1,
          }
        } else if (datIndex.id === '30' || datIndex.id === '31') {
          add_group(info, Defines.EntityGroup._3000)
        }
        const cdata = ret = make_character_data(info, make_frames(full_str, info.files));
        if (datIndex.id === '6') cook_louis_data(cdata);
        if (datIndex.id === '5') cook_rudolf_data(cdata);
        break;
      }
      case '3': ret = make_ball_data(base as IBallInfo, make_frames<IBallFrameInfo>(full_str, base.files), datIndex); break;
      case '5': ret = make_entity_data(base as IGameObjInfo, make_frames(full_str, base.files)); break;
      default:
        console.warn('[dat_to_json] unknow dat type:', JSON.stringify(datIndex.type))
        ret = make_entity_data(base as IGameObjInfo, make_frames(full_str, base.files));
        break;
    }
    if (ret) ret.id = datIndex.id;
    return ret;
  } else {
    if ('small' in base && 'name' in base && 'head' in base) {
      return make_character_data(base as ICharacterInfo, make_frames(full_str, base.files))
    }
    if ('weapon_hp' in base) {
      const info = base as IWeaponInfo;
      return make_weapon_data(info, full_str, make_frames(full_str, info.files));
    }
    if ('weapon_hit_sound' in base)
      return make_ball_data(base as IBallInfo, make_frames<IBallFrameInfo>(full_str, base.files));
    return make_entity_data(base as IGameObjInfo, make_frames(full_str, base.files));
  }
}