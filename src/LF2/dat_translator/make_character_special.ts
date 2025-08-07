import { BuiltIn_OID, Defines, EntityGroup } from "../defines";
import { ArmorEnum } from "../defines/ArmorEnum";
import { IEntityData } from "../defines/IEntityData";
import { add_entity_groups } from "./add_entity_to_group";
import { make_louis_data, make_rudolf_data } from "./cook_louis_data";

export function make_character_special(data: IEntityData) {
  const num_id = Number(data.id);

  if ((num_id >= 30 && num_id <= 39) || (num_id >= 50 && num_id <= 59)) {
    add_entity_groups(data.base, EntityGroup.Hidden);
  }
  if (num_id >= 1 && num_id <= 29) {
    add_entity_groups(data.base, EntityGroup.Regular);
  }
  switch (data.id as BuiltIn_OID) {
    case BuiltIn_OID.Julian:
      add_entity_groups(data.base, EntityGroup.Boss);
      data.base.ce = 3;
      data.base.armor = {
        fireproof: 1,
        antifreeze: 1,
        hit_sounds: ["data/002.wav.mp3"],
        type: ArmorEnum.Fall,
        toughness: Defines.DEFAULT_FALL_VALUE_MAX - Defines.DEFAULT_FALL_VALUE_DIZZY,
      };
      break;
    case BuiltIn_OID.Firzen:
      add_entity_groups(data.base, EntityGroup.Boss);
      data.base.ce = 2;
      break;
    case BuiltIn_OID.Knight:
      data.base.armor = {
        hit_sounds: ["data/085.wav.mp3"],
        type: ArmorEnum.Fall,
        toughness: Defines.DEFAULT_FALL_VALUE_MAX - Defines.DEFAULT_FALL_VALUE_DIZZY,
      };
      break;
    case BuiltIn_OID.Louis:
      data.base.armor = {
        hit_sounds: ["data/085.wav.mp3"],
        type: ArmorEnum.Defend,
        fulltime: false,
        toughness: 30,
      };
      make_louis_data(data)
      break;
    case BuiltIn_OID.Bandit:
    case BuiltIn_OID.Hunter:
      add_entity_groups(data.base, EntityGroup._3000);
      break;
    case BuiltIn_OID.Rudolf:
      make_rudolf_data(data);
      break;
    case BuiltIn_OID.LouisEX:
      add_entity_groups(data.base, EntityGroup.Boss);
      break;
    case BuiltIn_OID.Bat:
      add_entity_groups(data.base, EntityGroup.Boss);
      break;
    case BuiltIn_OID.Template:
      add_entity_groups(data.base, EntityGroup.Boss);
      break;
    case BuiltIn_OID.Justin:
    case BuiltIn_OID.Knight:
    case BuiltIn_OID.Jan:
    case BuiltIn_OID.Monk:
    case BuiltIn_OID.Sorcerer:
    case BuiltIn_OID.Jack:
    case BuiltIn_OID.Mark:
    case BuiltIn_OID.Deep:
    case BuiltIn_OID.John:
    case BuiltIn_OID.Henry:
    case BuiltIn_OID.Firen:
    case BuiltIn_OID.Freeze:
    case BuiltIn_OID.Dennis:
    case BuiltIn_OID.Woody:
    case BuiltIn_OID.Davis:
    case BuiltIn_OID.Weapon0:
    case BuiltIn_OID.Weapon2:
    case BuiltIn_OID.Weapon4:
    case BuiltIn_OID.Weapon5:
    case BuiltIn_OID.Weapon6:
    case BuiltIn_OID.Weapon1:
    case BuiltIn_OID.Weapon3:
    case BuiltIn_OID.Weapon8:
    case BuiltIn_OID.Weapon9:
    case BuiltIn_OID.Weapon10:
    case BuiltIn_OID.Weapon11:
    case BuiltIn_OID.Criminal:
    case BuiltIn_OID.JohnBall:
    case BuiltIn_OID.HenryArrow1:
    case BuiltIn_OID.RudolfWeapon:
    case BuiltIn_OID.DeepBall:
    case BuiltIn_OID.HenryWind:
    case BuiltIn_OID.DennisBall:
    case BuiltIn_OID.WoodyBall:
    case BuiltIn_OID.DavisBall:
    case BuiltIn_OID.HenryArrow2:
    case BuiltIn_OID.FreezeBall:
    case BuiltIn_OID.FirenBall:
    case BuiltIn_OID.FirenFlame:
    case BuiltIn_OID.FreezeColumn:
    case BuiltIn_OID.Weapon7:
    case BuiltIn_OID.JohnBiscuit:
    case BuiltIn_OID.DennisChase:
    case BuiltIn_OID.JackBall:
    case BuiltIn_OID.JanChaseh:
    case BuiltIn_OID.JanChase:
    case BuiltIn_OID.FirzenChasef:
    case BuiltIn_OID.FirzenChasei:
    case BuiltIn_OID.FirzenBall:
    case BuiltIn_OID.BatBall:
    case BuiltIn_OID.BatChase:
    case BuiltIn_OID.JustinBall:
    case BuiltIn_OID.JulianBall:
    case BuiltIn_OID.JulianBall2:
    case BuiltIn_OID.Etc:
    case BuiltIn_OID.BrokenWeapon:
      break;
  }
}