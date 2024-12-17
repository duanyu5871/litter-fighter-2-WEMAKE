import { IOpointInfo, IWeaponData, IWeaponStrengthInfo } from '../defines';
import { IFrameInfo } from "../defines/IFrameInfo";
import { IWeaponFrameIndexes } from '../defines/IWeaponFrameIndexes';
import { IWeaponInfo } from "../defines/IWeaponInfo";
import { Defines } from '../defines/defines';
import { match_all } from '../utils/string_parser/match_all';
import { match_block_once } from '../utils/string_parser/match_block';
import { match_colon_value } from '../utils/string_parser/match_colon_value';
import { to_num } from '../utils/type_cast/to_num';
import { not_empty_str } from '../utils/type_check';
import { add_entity_groups } from './add_entity_to_group';
import cook_itr from './cook_itr';
import { take } from './take';

const indexes_map: Record<Defines.WeaponType, IWeaponFrameIndexes> = {
  [Defines.WeaponType.None]: {
    in_the_sky: '',
    on_ground: '',
    just_on_ground: '',
    throw_on_ground: '',
    throwing: '',
  },
  [Defines.WeaponType.Stick]: {
    in_the_sky: '0',
    on_ground: '60',
    just_on_ground: '70',
    throw_on_ground: '71',
    throwing: '40',
  },
  [Defines.WeaponType.Heavy]: {
    in_the_sky: '0',
    on_ground: '20',
    just_on_ground: '21',
    throw_on_ground: '71',
    throwing: '0',
  },
  [Defines.WeaponType.Knife]: {
    in_the_sky: '0',
    on_ground: '60',
    just_on_ground: '70',
    throw_on_ground: '71',
    throwing: '40',
  },
  [Defines.WeaponType.Baseball]: {
    in_the_sky: '0',
    on_ground: '60',
    just_on_ground: '70',
    throw_on_ground: '71',
    throwing: '40',
  },
  [Defines.WeaponType.Drink]: {
    in_the_sky: '0',
    on_ground: '60',
    just_on_ground: '70',
    throw_on_ground: '71',
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
  if (!list.length) return void 0;
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
  if (sound_1) info.dead_sounds = [sound_1 + '.mp3']

  const sound_2 = take(info, 'weapon_drop_sound')
  if (sound_2) info.drop_sounds = [sound_2 + '.mp3']

  const sound_3 = take(info, 'weapon_hit_sound')
  if (sound_3) info.hit_sounds = [sound_3 + '.mp3']

  const drop_hurt = take(info, 'weapon_drop_hurt')
  if (drop_hurt && Number(drop_hurt)) info.drop_hurt = Number(drop_hurt)

  return {
    id: '',
    on_dead: { id: Defines.FrameId.Gone },
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

export function make_weapon_special(data: IWeaponData) {
  const ooo = (...frame_ids: string[]): IOpointInfo[] => {
    const aa = [
      { dvy: 5, dvx: -1, },
      { dvy: 5, dvx: 1, },
      { dvy: 3 },
      { dvy: 2, dvx: 2, },
      { dvy: 2, dvx: -2, },
      { dvy: 4, dvx: -1.5, },
      { dvy: 4, dvx: 1.5, },
      { dvy: 2 },
      { dvy: 1, dvx: 1, },
      { dvy: 1, dvx: -1, },
    ]
    return frame_ids.map((frame_id, idx) => {
      return {
        x: 24,
        y: 24,
        action: { id: frame_id },
        oid: '999',
        ...aa[idx]
      }
    });
  }

  const num_data_id = Number(data.id);
  if (num_data_id >= 100 || num_data_id <= 199) {
    add_entity_groups(
      data.base,
      Defines.EntityGroup.VsRegularWeapon,
      Defines.EntityGroup.StageRegularWeapon
    )
  }
  switch (data.id) {
    case "100": // #stick
      data.base.brokens = ooo('10', '10', '14', '14', '14')

      break;
    case "101": // #hoe
      data.base.brokens = ooo('30', '30', '20', '20', '24')

      break;
    case "120": // #knife
      data.base.brokens = ooo('30', '30', '24', '24')

      break;
    case "121": // #baseball
      data.base.brokens = ooo('60', '60', '60', '60', '60')

      break;
    case "122": // #milk
      data.base.brokens = ooo('70', '50', '80', '50', '50')
      add_entity_groups(data.base, Defines.EntityGroup.VsRegularWeapon)
      break;
    case "150": // #stone
      data.base.brokens = ooo('0', '0', '4', '4', '4')
      break;
    case "151": // #wooden_box
      data.base.brokens = ooo('40', '44', '50', '54', '54')
      break;
    case "123": // #beer
      data.base.brokens = ooo('160', '164', '164', '164', '164')
      add_entity_groups(data.base, Defines.EntityGroup.VsRegularWeapon)
      break;
    case "124": // #<
      data.base.brokens = ooo('170', '170', '170')
      break;
    case "217": // #louis_armour
      data.base.brokens = ooo('174', '174', '174', '174', '174')
      break;
    case "218": // #louis_armour
      data.base.brokens = ooo('174', '174', '174', '174', '174')
      break;
    case "213": // #ice_sword
      data.base.brokens = ooo('150', '150', '150', '154', '154', '154', '154')
      break;
  }
}