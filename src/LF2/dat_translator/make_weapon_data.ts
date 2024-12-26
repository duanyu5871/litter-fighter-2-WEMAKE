import { IEntityInfo } from '../defines';
import { IEntityData } from "../defines/IEntityData";
import { EntityEnum } from '../defines/EntityEnum';
import { IFrameIndexes } from '../defines/IFrameIndexes';
import { IFrameInfo } from "../defines/IFrameInfo";
import { Defines } from '../defines/defines';
import { make_itr_prefabs } from './make_itr_prefabs';
import { take } from './take';

const indexes_map: Record<Defines.WeaponType, IFrameIndexes> = {
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

export function make_weapon_data(info: IEntityInfo, full_str: string, frames: Record<string, IFrameInfo>): IEntityData {
  const itr_prefabs = make_itr_prefabs(full_str);
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

  const weapon_hp = take(info, 'weapon_hp')
  if (weapon_hp && Number(weapon_hp)) info.hp = Number(weapon_hp)

  return {
    id: '',
    on_dead: { id: Defines.FrameId.Gone },
    type: EntityEnum.Weapon,
    base: info,
    itr_prefabs,
    frames,
    indexes
  };
}

