export * from "./arithmetic_progression";
export * from "./clamp";
export * from "./float_equal";
export * from "./random";

export const floor = Math.floor;
export const ceil = Math.ceil;
export const between = (v: number, min: number, max: number) => v >= min && v <= max
export const abs = Math.abs;
