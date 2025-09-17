import { IFrameInfo } from "../defines/IFrameInfo";
import { IQube } from "../defines/IQube";

export function cook_frame_indicator_info(frame: IFrameInfo) {
  const { pic, bdy, itr, opoint, cpoint, bpoint, wpoint } = frame;
  if (!pic || !("w" in pic)) return;
  const f_qube_1: IQube = {
    x: -frame.centerx,
    y: frame.centery - pic.h,
    w: pic.w,
    h: pic.h,
    z: 0,
    l: 0,
  };
  const f_qube_2: IQube = {
    ...f_qube_1,
    x: frame.centerx - f_qube_1.w,
  };
  frame.indicator_info = {
    1: f_qube_1,
    [-1]: f_qube_2,
  };

  opoint?.forEach((o) => {
    const w = 2;
    const h = 2;
    const rect_1: IQube = {
      w,
      h,
      x: f_qube_1.x + o.x - w / 2,
      y: f_qube_1.y + f_qube_1.h - o.y - h / 2,
      z: o.z || 0,
      l: 0,
    };
    const rect_2: IQube = {
      ...rect_1,
      x: f_qube_2.x + f_qube_1.w - w - o.x,
    };
    o.indicator_info = { 1: rect_1, [-1]: rect_2 };
  });
  if (cpoint) {
    const o = cpoint;
    const w = 2;
    const h = 2;
    const rect_1: IQube = {
      w,
      h,
      x: f_qube_1.x + o.x - w / 2,
      y: f_qube_1.y + f_qube_1.h - o.y - h / 2,
      z: o.z || 0,
      l: 0,
    };
    const rect_2: IQube = {
      ...rect_1,
      x: f_qube_2.x + f_qube_1.w - w - o.x,
    };
    o.indicator_info = { 1: rect_1, [-1]: rect_2 };
  }
  if (bpoint) {
    const o = bpoint;
    const w = 2;
    const h = 2;
    const rect_1: IQube = {
      w,
      h,
      x: f_qube_1.x + o.x - w / 2,
      y: f_qube_1.y + f_qube_1.h - o.y - h / 2,
      z: o.z || 0,
      l: 0,
    };
    const rect_2: IQube = {
      ...rect_1,
      x: f_qube_2.x + f_qube_1.w - w - o.x,
    };
    o.indicator_info = { 1: rect_1, [-1]: rect_2 };
  }
  if (wpoint) {
    const o = wpoint;
    const w = 2;
    const h = 2;
    const rect_1: IQube = {
      w,
      h,
      x: f_qube_1.x + o.x - w / 2,
      y: f_qube_1.y + f_qube_1.h - o.y - h / 2,
      z: o.z || 0,
      l: 0,
    };
    const rect_2: IQube = {
      ...rect_1,
      x: f_qube_2.x + f_qube_1.w - w - o.x,
    };
    o.indicator_info = { 1: rect_1, [-1]: rect_2 };
  }
  bdy?.forEach((o) => {
    const rect_1: IQube = {
      w: o.w,
      h: o.h,
      x: f_qube_1.x + o.x,
      y: f_qube_1.y + f_qube_1.h - o.y - o.h,
      z: o.z,
      l: o.l,
    };
    const rect_2: IQube = {
      ...rect_1,
      x: f_qube_2.x + f_qube_1.w - o.w - o.x,
    };
    o.indicator_info = { 1: rect_1, [-1]: rect_2 };
  });
  itr?.forEach((o) => {
    const rect_1: IQube = {
      w: o.w,
      h: o.h,
      x: f_qube_1.x + o.x,
      y: f_qube_1.y + f_qube_1.h - o.y - o.h,
      z: o.z,
      l: o.l,
    };
    const rect_2: IQube = {
      ...rect_1,
      x: f_qube_2.x + f_qube_1.w - o.w - o.x,
    };
    o.indicator_info = { 1: rect_1, [-1]: rect_2 };
  });
}
