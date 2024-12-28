import { Defines } from "../defines/defines";

export function get_team_text_color(team: string | number) {
  const info =
    Defines.TeamInfoMap[team] ||
    Defines.TeamInfoMap[Defines.TeamEnum.Independent];
  return info.txt_color;
}
