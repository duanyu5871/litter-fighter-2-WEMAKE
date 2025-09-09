import { IEntityData } from "../../defines";
import { IFighterSumInfo } from "./IFighterSumInfo";
import { make_team_sum } from "./make_team_sum";

export const make_fighter_sum = (data: IEntityData): IFighterSumInfo => {
  return { ...make_team_sum(''), data };
};

