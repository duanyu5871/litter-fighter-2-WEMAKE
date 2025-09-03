import { BuiltIn_OID, EntityGroup } from "../defines";
import { ArmorEnum } from "../defines/ArmorEnum";
import { IEntityData } from "../defines/IEntityData";
import { add_entity_groups } from "./add_entity_to_group";
import { make_fighter_data_rudolf } from "./fighters/make_fighter_data_rudolf";
import { make_figther_data_louis } from "./fighters/make_figther_data_louis";
import { make_fighter_data_bat } from "./fighters/make_fighter_data_bat";
import { make_fighter_data_davis } from "./fighters/make_fighter_data_davis";
import { make_fighter_data_deep } from "./fighters/make_fighter_data_deep";
import { make_fighter_data_firzen } from "./fighters/make_fighter_data_firzen";
import { make_fighter_data_julian } from "./fighters/make_fighter_data_julian";
import { make_fighter_data_knigt } from "./fighters/make_fighter_data_knigt";
import { make_fighter_data_dennis } from "./fighters/make_fighter_data_dennis";

export function make_fighter_special(data: IEntityData): IEntityData {
  const num_id = Number(data.id);

  if ((num_id >= 30 && num_id <= 39) || (num_id >= 50 && num_id <= 59)) {
    add_entity_groups(data.base, EntityGroup.Hidden);
  }
  if (num_id >= 1 && num_id <= 29) {
    add_entity_groups(data.base, EntityGroup.Regular);
  }
  switch (data.id as BuiltIn_OID) {
    case BuiltIn_OID.Julian: return make_fighter_data_julian(data)
    case BuiltIn_OID.Firzen: return make_fighter_data_firzen(data);
    case BuiltIn_OID.Knight: return make_fighter_data_knigt(data);
    case BuiltIn_OID.Louis: return make_figther_data_louis(data);
    case BuiltIn_OID.Rudolf: return make_fighter_data_rudolf(data);
    case BuiltIn_OID.Deep: return make_fighter_data_deep(data);
    case BuiltIn_OID.Davis: return make_fighter_data_davis(data);
    case BuiltIn_OID.Dennis: return make_fighter_data_dennis(data);

    case BuiltIn_OID.Bandit:
    case BuiltIn_OID.Hunter:
      add_entity_groups(data.base, EntityGroup._3000);
      break;
    case BuiltIn_OID.LouisEX:
      add_entity_groups(data.base, EntityGroup.Boss);
      break;
    case BuiltIn_OID.Bat: return make_fighter_data_bat(data);
    case BuiltIn_OID.Template:
      add_entity_groups(data.base, EntityGroup.Hidden);
      break;
    case BuiltIn_OID.Jan:
      data.base.files['0'].variants = ['2']
      data.base.files['1'].variants = ['3']
      break;
    case BuiltIn_OID.Justin:
    case BuiltIn_OID.Monk:
    case BuiltIn_OID.Sorcerer:
    case BuiltIn_OID.Jack:
    case BuiltIn_OID.Mark:
    case BuiltIn_OID.John:
    case BuiltIn_OID.Henry:
    case BuiltIn_OID.Firen:
    case BuiltIn_OID.Freeze:
    case BuiltIn_OID.Woody:

    // not charctor, ignore it;
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
  return data;
}


