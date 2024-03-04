import { INextFrameFlags, TFace } from "../../js_utils/lf2_type";
import { Entity } from "./Entity";

export function same_face_flags(ref: Entity, target: Entity): INextFrameFlags {
  if (ref.face !== target.face) return {}
  return { turn: 1 }
}
export function different_face_flags(ref: Entity, target: Entity): INextFrameFlags {
  if (ref.face === target.face) return {}
  return { turn: 1 }
}

export function same_face(ref: Entity, target: Entity): TFace {
  return ref.face === target.face ? 1 : -1;
}