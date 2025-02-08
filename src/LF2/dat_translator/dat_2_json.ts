import { IBgData, IStageInfo, WeaponType } from "../defines";
import { IEntityPictureInfo } from "../defines/IEntityPictureInfo";
import { IBaseData } from "../defines/IBaseData";
import { IEntityData } from "../defines/IEntityData";
import { EntityEnum } from "../defines/EntityEnum";
import { IDatIndex } from "../defines/IDatIndex";
import { IEntityInfo } from "../defines/IEntityInfo";
import { Defines } from "../defines/defines";
import { set_obj_field } from "../utils/container_help/set_obj_field";
import { match_block_once } from "../utils/string_parser/match_block";
import { match_colon_value } from "../utils/string_parser/match_colon_value";
import { make_ball_data } from "./make_ball_data";
import { make_ball_special } from "./make_ball_special";
import { make_bg_data } from "./make_bg_data";
import { make_character_data } from "./make_character_data";
import { make_character_special } from "./make_character_special";
import { make_entity_data } from "./make_entity_data";
import { make_entity_special } from "./make_entity_special";
import { make_frames } from "./make_frames";
import { make_frames_special } from "./make_frames_special";
import { make_stage_info_list as make_stage_infos } from "./make_stage_info_list";
import { make_weapon_data } from "./make_weapon_data";
import { make_weapon_special } from "./make_weapon_special";

export default function dat_to_json(
  full_str: string,
  datIndex: IDatIndex,
): void | IStageInfo[] | IBgData | IBaseData {
  full_str = full_str.replace(/\\\\/g, "/");
  if (full_str.startsWith("<stage>")) return make_stage_infos(full_str);
  if (full_str.startsWith("name:")) return make_bg_data(full_str, datIndex);
  const infos_str = match_block_once(full_str, "<bmp_begin>", "<bmp_end>");
  if (!infos_str) {
    return;
  }

  let ret: IEntityData | undefined = void 0;
  const base: IEntityInfo = {
    name: "",
    files: {},
  };
  for (const info_str of infos_str.trim().split("\n")) {
    let reg_result;
    reg_result = info_str.match(/name:\s*(\S*)/);
    if (reg_result) {
      base.name = reg_result[1];
      continue;
    }
    reg_result = info_str.match(/head:\s*(\S*)/);
    if (reg_result) {
      base.head = reg_result[1].replace(/.bmp$/, ".png");
      continue;
    }
    reg_result = info_str.match(/small:\s*(\S*)/);
    if (reg_result) {
      base.small = reg_result[1].replace(/.bmp$/, ".png");
      continue;
    }
    if (info_str.startsWith("file(")) {
      const file_id = base.files ? Object.keys(base.files).length : 0;
      const file: IEntityPictureInfo = {
        id: "" + file_id,
        path: "",
        row: 0,
        col: 0,
        cell_w: 0,
        cell_h: 0,
      };
      for (const [key, value] of match_colon_value(info_str)) {
        if (key.startsWith("file")) {
          file.path = value.replace(/.bmp$/, ".png");
        } else if (key === "w") {
          file.cell_w = Number(value);
        } else if (key === "h") {
          file.cell_h = Number(value);
        } else {
          (file as any)[key] = Number(value);
        }
      }
      base.files = set_obj_field(base.files, "" + file_id, file);
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

  switch ("" + datIndex.type) {
    case "0":
      ret = make_character_data(base, make_frames(full_str, base.files));
      break;
    case "1":
      base.type =
        {
          "120": WeaponType.Knife, // Knife
          "124": WeaponType.Knife, // Boomerang
        }["" + datIndex.id] ?? WeaponType.Stick;
      base.bounce = 0.2;
      base.name =
        datIndex.hash ?? datIndex.file.replace(/[^a-z|A-Z|0-9|_]/g, "");
      ret = make_weapon_data(base, full_str, make_frames(full_str, base.files));
      break;
    case "2":
      base.type = WeaponType.Heavy;
      switch (datIndex.id) {
        case "150":
          base.bounce = 0.2;
          break;
        default:
          base.bounce = 0.1;
          break;
      }
      base.name =
        datIndex.hash ?? datIndex.file.replace(/[^a-z|A-Z|0-9|_]/g, "");
      ret = make_weapon_data(base, full_str, make_frames(full_str, base.files));
      break;
    case "3":
      ret = make_ball_data(base, make_frames(full_str, base.files), datIndex);
      break;
    case "4":
      base.type = WeaponType.Baseball;
      base.bounce = 0.45;
      base.name =
        datIndex.hash ?? datIndex.file.replace(/[^a-z|A-Z|0-9|_]/g, "");
      ret = make_weapon_data(base, full_str, make_frames(full_str, base.files));
      break;
    case "5":
      ret = make_entity_data(base, make_frames(full_str, base.files));
      break;
    case "6":
      base.type = WeaponType.Drink;
      base.bounce = 0.45;
      base.name =
        datIndex.hash ?? datIndex.file.replace(/[^a-z|A-Z|0-9|_]/g, "");
      ret = make_weapon_data(base, full_str, make_frames(full_str, base.files));
      break;
    default:
      console.warn(
        "[dat_to_json] unknow dat type:",
        JSON.stringify(datIndex.type),
      );
      ret = make_entity_data(base, make_frames(full_str, base.files));
      break;
  }
  if (ret) ret.id = datIndex.id;
  if (!ret.base.name) ret.base.name = ret.type + "_" + ret.id;

  switch (ret.type) {
    case EntityEnum.Entity:
      make_entity_special(ret);
      break;
    case EntityEnum.Character:
      make_character_special(ret);
      break;
    case EntityEnum.Weapon:
      make_weapon_special(ret);
      break;
    case EntityEnum.Ball:
      make_ball_special(ret);
      break;
  }
  make_frames_special(ret);
  return ret;
}
