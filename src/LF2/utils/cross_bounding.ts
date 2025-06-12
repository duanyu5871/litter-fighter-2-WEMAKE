import { IBounding } from "../defines";

export function cross_bounding(r0: IBounding, r1: IBounding): IBounding {
  return {
    left: Math.max(r0.left, r1.left),
    right: Math.min(r0.right, r1.right),
    bottom: Math.max(r0.bottom, r1.bottom),
    top: Math.min(r0.top, r1.top),
    far: Math.max(r0.far, r1.far),
    near: Math.min(r0.near, r1.near),
  };
}
