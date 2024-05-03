import { Defines } from "../../common/lf2_type/defines";

export function get_team_text_color(team: string | number) {
  const info = Defines.TeamColorInfoMap[team] || Defines.TeamColorInfoMap.I
  return info.txt_color;
}
