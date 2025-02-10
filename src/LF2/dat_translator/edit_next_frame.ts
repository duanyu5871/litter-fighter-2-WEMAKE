import { INextFrame, TNextFrame } from "../defines/js";

export function edit_next_frame(
  nexts: TNextFrame,
  fn: (item: INextFrame, idx: number, arr: INextFrame[]) => void,
) {
  (Array.isArray(nexts) ? nexts : [nexts]).forEach(fn);
  return nexts;
}
export function add_next_frame(
  src: TNextFrame | undefined,
  item: INextFrame,
  ...items: INextFrame[]
): TNextFrame {
  if (Array.isArray(src)) {
    return [...src, item, ...items];
  } else if (src) {
    return [src, item, ...items];
  } else if (items.length) {
    return [item, ...items];
  } else {
    return item;
  }
}
