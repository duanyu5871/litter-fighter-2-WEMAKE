import { Builtin_FrameId, IDatIndex, IEntityInfo, StateEnum, WeaponType } from "../defines";
import { EntityEnum } from "../defines/EntityEnum";
import { IEntityData } from "../defines/IEntityData";
import { IFrameIndexes } from "../defines/IFrameIndexes";
import { IFrameInfo } from "../defines/IFrameInfo";
import { traversal } from "../utils/container_help/traversal";
import { make_itr_prefabs } from "./make_itr_prefabs";
import { take } from "./take";

const indexes_map: Record<WeaponType, IFrameIndexes> = {
  [WeaponType.None]: {
    on_ground: "",
    just_on_ground: "",
    throw_on_ground: "",
    throwing: "",
  },
  [WeaponType.Stick]: {
    on_ground: "60",
    just_on_ground: "70",
    throw_on_ground: "71",
    throwing: "40",
  },
  [WeaponType.Heavy]: {
    on_ground: "20",
    just_on_ground: "21",
    throw_on_ground: "71",
    throwing: "0",
  },
  [WeaponType.Knife]: {
    on_ground: "60",
    just_on_ground: "70",
    throw_on_ground: "71",
    throwing: "40",
  },
  [WeaponType.Baseball]: {
    on_ground: "60",
    just_on_ground: "70",
    throw_on_ground: "71",
    throwing: "40",
  },
  [WeaponType.Drink]: {
    on_ground: "60",
    just_on_ground: "70",
    throw_on_ground: "71",
    throwing: "40",
  },
};

export function make_weapon_data(
  info: IEntityInfo,
  full_str: string,
  frames: Record<string, IFrameInfo>,
  datIndex: IDatIndex,
): IEntityData {
  info.name = datIndex.hash ?? datIndex.file.replace(/[^a-z|A-Z|0-9|_]/g, "");
  switch ('' + datIndex.type) {
    case "1":
      info.bounce = 0.2;
      info.type = {
        "120": WeaponType.Knife, // Knife
        "124": WeaponType.Knife, // Boomerang
      }["" + datIndex.id] ?? WeaponType.Stick;
      break;
    case "2":
      info.type = WeaponType.Heavy;
      switch (datIndex.id) {
        case "150": info.bounce = 0.2; break;
        default: info.bounce = 0.1; break;
      }
      break;
    case "4":
      info.type = WeaponType.Baseball;
      info.bounce = 0.45;
      break;
    case "6":
      info.type = WeaponType.Drink;
      info.bounce = 0.45;
      break;
  }

  const itr_prefabs = make_itr_prefabs(full_str);
  const indexes =
    indexes_map[info.type as WeaponType] ??
    indexes_map[WeaponType.None];
  const sound_1 = take(info, "weapon_broken_sound");
  if (sound_1) info.dead_sounds = [sound_1.replace(/\\/g, '/') + ".mp3"];

  const sound_2 = take(info, "weapon_drop_sound");
  if (sound_2) info.drop_sounds = [sound_2.replace(/\\/g, '/') + ".mp3"];

  const sound_3 = take(info, "weapon_hit_sound");
  if (sound_3) info.hit_sounds = [sound_3.replace(/\\/g, '/') + ".mp3"];



  const drop_hurt = take(info, "weapon_drop_hurt");
  if (drop_hurt && Number(drop_hurt)) info.drop_hurt = Number(drop_hurt);

  const weapon_hp = take(info, "weapon_hp");
  if (weapon_hp && Number(weapon_hp)) info.hp = Number(weapon_hp);

  const in_the_skys: string[] = []
  traversal(frames, (k, v) => {
    if (
      v.state === StateEnum.Weapon_InTheSky ||
      v.state === StateEnum.HeavyWeapon_InTheSky
    ) in_the_skys.push(k)
  })
  indexes.in_the_skys = in_the_skys
  return {
    id: "",
    on_dead: { id: Builtin_FrameId.Gone },
    type: EntityEnum.Weapon,
    base: info,
    itr_prefabs,
    frames,
    indexes,
  };
}
