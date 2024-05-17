import { IWeaponData, IWeaponStrengthInfo } from '../lf2_type';
import { IFrameInfo } from "../lf2_type/IFrameInfo";
import { IWeaponFrameIndexes } from '../lf2_type/IWeaponFrameIndexes';
import { IWeaponInfo } from "../lf2_type/IWeaponInfo";
import { Defines } from '../lf2_type/defines';
import { match_all } from '../string_parser/match_all';
import { match_block_once } from '../string_parser/match_block';
import { match_colon_value } from '../string_parser/match_colon_value';
import { to_num } from '../../LF2/utils/type_cast/to_num';
import { not_empty_str } from '../../LF2/utils/type_check';
import cook_itr from './cook_itr';
import { take } from './take';

const indexes_map: Record<Defines.WeaponType, IWeaponFrameIndexes> = {
  [Defines.WeaponType.None]: {
    in_the_sky: '',
    on_ground: '',
    just_on_ground: '',
    throwing: '',
  },
  [Defines.WeaponType.Stick]: {
    in_the_sky: '0',
    on_ground: '60',
    just_on_ground: '70',
    throwing: '40',
  },
  [Defines.WeaponType.Heavy]: {
    in_the_sky: '0',
    on_ground: '20',
    just_on_ground: '21',
    throwing: '0',
  },
  [Defines.WeaponType.Knife]: {
    in_the_sky: '0',
    on_ground: '60',
    just_on_ground: '70',
    throwing: '40',
  },
  [Defines.WeaponType.Baseball]: {
    in_the_sky: '0',
    on_ground: '60',
    just_on_ground: '70',
    throwing: '40',
  },
  [Defines.WeaponType.Drink]: {
    in_the_sky: '0',
    on_ground: '60',
    just_on_ground: '70',
    throwing: '40',
  }
}

function make_weapon_strength(full_str: string): IWeaponData['weapon_strength'] {
  const weapon_strength_str = match_block_once(full_str, '<weapon_strength_list>', '<weapon_strength_list_end>')?.trim();
  if (!not_empty_str(weapon_strength_str)) return void 0;

  const list = match_all(weapon_strength_str, /entry:\s*(\d+)\s*(\S+)\s*\n?(.*)\n?/g).map(([, id, name, remain]) => {
    const entry: IWeaponStrengthInfo = { id, name };
    for (const [key, value] of match_colon_value(remain)) {
      (entry as any)[key] = to_num(value) ?? value;
    }
    cook_itr(entry);
    return entry;
  });
  if (list.length) return void 0;
  const weapon_strength: IWeaponData['weapon_strength'] = {};
  for (const entry of list)
    weapon_strength[entry.id] = entry;
  return weapon_strength;
}
export function make_weapon_data(info: IWeaponInfo, full_str: string, frames: Record<string, IFrameInfo>): IWeaponData {
  const weapon_strength = make_weapon_strength(full_str);
  const indexes =
    indexes_map[info.type as Defines.WeaponType] ??
    indexes_map[Defines.WeaponType.None]
  const sound_1 = take(info, 'weapon_broken_sound')
  if (sound_1) info.weapon_broken_sound = sound_1 + '.ogg'

  const sound_2 = take(info, 'weapon_drop_sound')
  if (sound_2) info.weapon_drop_sound = sound_2 + '.ogg'

  const sound_3 = take(info, 'weapon_hit_sound')
  if (sound_3) info.weapon_hit_sound = sound_3 + '.ogg'

  return {
    id: '',
    type: 'weapon',
    base: info,
    weapon_strength,
    frames,
    indexes,
    is_base_data: true,
    is_game_obj_data: true,
    is_weapon_data: true,
  };
}
