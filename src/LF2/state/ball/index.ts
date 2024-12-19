
import { Defines } from "../../defines/defines";
import Ball from "../../entity/Ball";
import { States } from "../States";
import { ENTITY_STATES } from "..";
import BallState_Base from "../BallState_Base";

export const BALL_STATES = new States<Ball>();
for (const [k, v] of ENTITY_STATES.map) BALL_STATES.set(k, v)

BALL_STATES.set(Defines.State.Any, new BallState_Base())