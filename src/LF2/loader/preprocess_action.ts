import { Expression } from "../base/Expression";
import type { TAction } from "../defines";
import type LF2 from "../LF2";
import { is_non_blank_str } from "../utils";
import { get_val_geter_from_collision } from "./get_val_from_collision";
import { preprocess_next_frame } from "./preprocess_next_frame";

export function preprocess_action(lf2: LF2, action: TAction, jobs: Promise<void>[]): TAction {
  action.tester = action.test ? new Expression(
    action.test, void 0, get_val_geter_from_collision
  ) : void 0
  switch (action.type) {
    case "sound":
      for (const sound of action.path) {
        if (is_non_blank_str(sound) && !lf2.sounds.has(sound))
          jobs.push(lf2.sounds.load(sound, sound));
      }
      break;
    case "next_frame":
    case "defend":
    case "broken_defend":
      preprocess_next_frame(action.data);
      break;
  }
  return action;
}
preprocess_action.TAG = "preprocess_action";