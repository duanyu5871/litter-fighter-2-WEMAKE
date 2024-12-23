import { IFrameInfo } from '../defines';
import { IRect } from '../defines/IRect';


export function cook_frame_indicator_info(frame: IFrameInfo) {
  const { pic, bdy, itr } = frame;
  if (!pic || !('w' in pic)) return;
  const f_rect_1: IRect = {
    x: -frame.centerx,
    y: frame.centery - pic.h,
    w: pic.w,
    h: pic.h
  };
  const f_rect_2: IRect = {
    ...f_rect_1,
    x: frame.centerx - f_rect_1.w
  };
  frame.indicator_info = {
    1: f_rect_1,
    [-1]: f_rect_2
  };
  bdy?.forEach(o => {
    const rect_1: IRect = {
      w: o.w,
      h: o.h,
      x: f_rect_1.x + o.x,
      y: f_rect_1.y + f_rect_1.h - o.y - o.h,
    };
    const rect_2: IRect = {
      ...rect_1,
      x: f_rect_2.x + f_rect_1.w - o.w - o.x,
    };
    o.indicator_info = { 1: rect_1, [-1]: rect_2 };
  });
  itr?.forEach(o => {
    const rect_1: IRect = {
      w: o.w,
      h: o.h,
      x: f_rect_1.x + o.x,
      y: f_rect_1.y + f_rect_1.h - o.y - o.h,
    };
    const rect_2: IRect = {
      ...rect_1,
      x: f_rect_2.x + f_rect_1.w - o.w - o.x,
    };
    o.indicator_info = { 1: rect_1, [-1]: rect_2 };
  });
}
