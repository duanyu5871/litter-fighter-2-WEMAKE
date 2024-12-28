import { IStageInfo } from "../defines/IStageInfo";
import { IStageObjectInfo } from "../defines/IStageObjectInfo";
import { IStagePhaseInfo } from "../defines/IStagePhaseInfo";
import { match_colon_value } from "../utils/string_parser/match_colon_value";
import { match_hash_end } from "../utils/string_parser/match_hash_end";
import { take_blocks } from "../utils/string_parser/take_blocks";
import { to_num } from "../utils/type_cast/to_num";

export function make_stage_info_list(full_str: string): IStageInfo[] | void {
  full_str = full_str.replace(
    /<phase_end>[\n|\s|\r]*<stage>/g,
    "<phase_end><stage_end><stage>",
  );
  const stage_infos: IStageInfo[] = [];
  for (let stage_str of take_blocks(
    full_str,
    "<stage>",
    "<stage_end>",
    (v) => (full_str = v),
  )) {
    const stage_info: IStageInfo = {
      bg: "0",
      id: "",
      name: "",
      phases: [],
    };
    for (let phase_str of take_blocks(
      stage_str,
      "<phase>",
      "<phase_end>",
      (v) => (stage_str = v),
    )) {
      const phase_info: IStagePhaseInfo = {
        bound: 0,
        desc: "",
        objects: [],
      };
      for (let line of phase_str.trim().split("\n")) {
        line = line.trim();
        if (!line) continue;
        if (line.startsWith("bound")) {
          for (const [key, value] of match_colon_value(line)) {
            if (key === "bound")
              phase_info.bound = to_num(value) ?? phase_info.bound;
            if (key === "music")
              phase_info.music = value.replace(/\\/g, "/") + ".mp3";
          }
          phase_info.desc = match_hash_end(line)?.trim() ?? "";
        } else if (line.startsWith("music")) {
          for (const [key, value] of match_colon_value(line)) {
            if (key === "music")
              phase_info.music = value.replace(/\\/g, "/") + ".mp3";
          }
        } else if (line.startsWith("id")) {
          const object: IStageObjectInfo = {
            id: [],
            x: phase_info.bound,
          };
          if (line.indexOf("<soldier>") >= 0) object.is_soldier = true;
          if (line.indexOf("<boss>") >= 0) object.is_boss = true;
          for (const [key, value] of match_colon_value(line)) {
            if (key === "id") object.id = [value];
            else if (key === "act") object.act = value;
            else (object as any)[key] = to_num(value) ?? (object as any)[key];
          }
          phase_info.objects.push(object);
        }
      }
      stage_info.phases.push(phase_info);
    }
    const head = stage_str.replace(/\s+\n+/g, "\n").trim();
    for (const [key, value] of match_colon_value(head)) {
      (stage_info as any)[key] = value;
    }
    stage_info.name = (match_hash_end(head) ?? stage_info.id)
      .replace(/stage/gi, "")
      .trim();
    const nid = Number(stage_info.id);

    if (nid % 10 === 0) {
      stage_info.is_starting = true;
      stage_info.starting_name = "" + (1 + nid / 10);
    }
    if (nid === 50) {
      stage_info.starting_name = "Survival";
    }

    if (nid <= 9) {
      stage_info.bg = "2";
      if (nid < 9) stage_info.next = "" + (nid + 1);
    } else if (nid <= 19) {
      stage_info.bg = "3";
      if (nid < 19) stage_info.next = "" + (nid + 1);
    } else if (nid <= 29) {
      stage_info.bg = "5";
      if (nid < 29) stage_info.next = "" + (nid + 1);
    } else if (nid <= 39) {
      stage_info.bg = "6";
      if (nid < 39) stage_info.next = "" + (nid + 1);
    } else if (nid <= 49) {
      stage_info.bg = "7";
      if (nid < 49) stage_info.next = "" + (nid + 1);
    } else {
      stage_info.bg = "8";
    }
    stage_infos.push(stage_info);
  }

  for (const stage_info of stage_infos) {
    const first_phase = stage_info.phases[0];
    if (!first_phase) return;

    first_phase.cam_jump_to_x = 0;
    first_phase.player_jump_to_x = 0;
  }
  return stage_infos.sort((a, b) => Number(a.id) - Number(b.id));
}
