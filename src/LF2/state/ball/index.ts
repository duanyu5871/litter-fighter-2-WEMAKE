
import { Defines } from "../../../common/lf2_type/defines";
import { States } from "../base/States";
import { ENTITY_STATES } from "../entity";
import BaseBallState from "./BaseBallState";

export const BALL_STATES = new States();
for (const [k, v] of ENTITY_STATES.map) BALL_STATES.set(k, v)

BALL_STATES.set(Defines.State.Any, new BaseBallState())