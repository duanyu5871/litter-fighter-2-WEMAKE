import { TFace } from "../../js_utils/lf2_type";
import { Entity } from "./Entity";


export function same_face(ref: Entity, target: Entity): TFace {
  return ref.face === target.face ? 1 : -1;
}

export function turn_face(f: TFace): TFace;
export function turn_face(f?: TFace): TFace | undefined;
export function turn_face(f?: TFace): TFace | undefined { return f === 1 ? -1 : 1 }