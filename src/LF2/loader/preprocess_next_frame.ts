import { Expression } from "../base/Expression";
import { INextFrame } from "../defines";
import { get_val_getter_from_entity } from "./get_val_from_entity";

export function preprocess_next_frame(i: INextFrame | INextFrame[]): void {
  if (Array.isArray(i)) {
    for (const v of i) preprocess_next_frame(v);
    return;
  }
  if (typeof i.expression !== "string") return;
  i.judger = new Expression(i.expression, void 0, get_val_getter_from_entity);
}
preprocess_next_frame.Tag = 'preprocess_next_frame'