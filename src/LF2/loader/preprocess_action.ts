import { Expression } from "../base/Expression";
import { TAction } from "../defines";
import { get_val_geter_from_collision } from "./get_val_from_collision";
import { preprocess_next_frame } from "./preprocess_next_frame";

export function preprocess_action(action: TAction) {
  if (action.test) {
    action.tester = new Expression(
      action.test, void 0, get_val_geter_from_collision
    );
  }
  switch (action.type) {
    case "next_frame":
    case "defend":
    case "broken_defend":
      preprocess_next_frame(action.data);
      break;
  }
}
preprocess_action.TAG = "preprocess_action";