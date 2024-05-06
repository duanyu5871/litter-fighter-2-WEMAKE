import { Defines } from "../../common/lf2_type/defines";

export function get_team_shadow_color(team: string | number) {
  const info = Defines.TeamInfoMap[team] || Defines.TeamInfoMap[Defines.TeamEnum.Independent]
  return info.txt_shadow_color;
};
