import { ISumInfo } from "./ISumInfo";

export const make_team_sum = (team: string): ISumInfo => ({
  wins: 0,
  loses: 0,
  kills: 0,
  damages: 0,
  pickings: 0,
  spawns: 0,
  deads: 0,
  team
});
