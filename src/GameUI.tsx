import { useCallback, useEffect, useRef, useState } from 'react';
import LF2 from './LF2/LF2';
import { Condition } from './LF2/loader/Condition';
import { TImageInfo, image_pool } from './LF2/loader/loader';
import random_get from './Utils/random_get';
import { arithmetic_progression } from './js_utils/arithmetic_progression';
import { is_bool } from './js_utils/is_bool';
import { is_num } from './js_utils/is_num';
import { is_str } from './js_utils/is_str';
import random_take from './Utils/random_take';

export function GameUI(props: { lf2?: LF2; }) {
  const { lf2 } = props;
  const canvas_ref = useRef<HTMLCanvasElement>(null);
  const offscreen_ref = useRef<HTMLCanvasElement | null>(null);
  const mem = useRef({
    pointer_down: false,
    mouse_x: NaN,
    mouse_y: NaN,
  });
  const f_w = 794;
  const f_h = 450;
  const menu_w = 282;
  const menu_h = 119;
  const menu_x = Math.floor(f_w * .5);
  const menu_y = Math.floor(f_h * .6);
  const menu_cx = Math.floor(menu_w * .5);
  const menu_cy = Math.floor(menu_h * .5);

  const www = 'entry'
  const [raw_layouts_list, set_raw_layouts] = useState<{ [x in string]: ILayoutInfo[] }>({
    "loading": [{
      key: 'bg_wait',
      img: 'sprite/MENU_WAIT.png',
      size: [f_w, 0],
    }, {
      key: 'txt_loading_content',
      txt: 'txt_loading_content',
      txt_fill: 'white',
      pos: [610, 75],
      font: ['16px', 'Arial']
    }],
    "entry": [{
      key: 'bg_left',
      which: 'random_int_in_range(0,12,1)',
      img: arithmetic_progression(1, 13, 1).map(n => `sprite/MENU_BACK${n}.png`),
      s_rect: [0, 0, 378, 546],
      size: [0, f_h],
      pos: [0, 0],
    }, {
      key: 'bg_right',
      which: 'random_int_in_range(0,12,1)',
      img: arithmetic_progression(1, 13, 1).map(n => `sprite/MENU_BACK${n}.png`),
      s_rect: [0, 0, 378, 546],
      center: [1, 0],
      size: [0, f_h],
      pos: [f_w - 378, 0],
      flip_x: true,
    }, {
      key: 'main_title',
      img: 'sprite/MENU_CLIP.png',
      s_rect: [0, 41, 496, 80],
      center: [496 / 2, 0],
      size: [496, 80],
      pos: [796 / 2, 40]
    }, {
      key: 'main_menu',
      img: 'sprite/MENU_CLIP.png',
      s_rect: [0, 125, 282, 119],
      center: [menu_cx, menu_cy],
      size: [menu_w, menu_h],
      pos: [menu_x, menu_y]
    }, {
      visible: 'mouse_on_me==1',
      key: 'start_local_game',
      img: 'sprite/MENU_CLIP.png',
      s_rect: [535, 105, 256, 26],
      center: [256 / 2 - 1, 0],
      size: [256, 26],
      pos: [796 / 2, menu_y - menu_cy + 13]
    }, {
      visible: 'mouse_on_me==1',
      key: 'network_game',
      img: 'sprite/MENU_CLIP.png',
      s_rect: [535, 137, 256, 26],
      center: [256 / 2 - 1, 0],
      size: [256, 26],
      pos: [796 / 2, menu_y - menu_cy + 45]
    }, {
      visible: 'mouse_on_me==1',
      key: 'ctrl_settings',
      img: 'sprite/MENU_CLIP.png',
      s_rect: [535, 168, 256, 26],
      center: [256 / 2 - 1, 0],
      size: [256, 26],
      pos: [796 / 2, menu_y - menu_cy + 76]
    }]
  });
  const [layouts, set_layouts] = useState<ICookedLayoutInfo[]>([]);

  const draw_ui = useCallback(async () => {
    const canvas = canvas_ref.current;
    const onscreen_ctx = canvas?.getContext('2d');

    const offscreen = offscreen_ref.current;
    const offscreen_ctx = offscreen?.getContext('2d');
    if (!canvas || !offscreen || !offscreen_ctx || !onscreen_ctx || !lf2) return;

    const { width, height } = canvas;
    const screen_w = Math.floor(width);
    const screen_h = Math.floor(height);

    if (offscreen.width !== screen_w || offscreen.height !== screen_h) {
      offscreen.width = screen_w;
      offscreen.height = screen_h;
    } else {
      offscreen_ctx.fillStyle = 'rgb(16, 32, 108)';
      offscreen_ctx.fillRect(0, 0, screen_w, screen_h);
    }

    for (const layout of layouts) {
      const { _visible, _img, flip_x, flip_y } = layout;
      if (!_visible(layout)) continue;
      if (_img) {
        const [w, h] = layout._size;
        const [l, t] = layout._left_top;
        const dx = screen_w * l / f_w
        const dy = screen_h * t / f_h
        const dw = screen_w * w / f_w
        const dh = screen_h * h / f_h
        if (flip_x || flip_y) {
          offscreen_ctx.translate(flip_x ? 2 * dx + dw : 0, flip_y ? 2 * dy + dh : 0);
          offscreen_ctx.scale(flip_x ? -1 : 1, flip_y ? -1 : 1);
        }
        offscreen_ctx.drawImage(_img.img_ele, ...layout._s_rect, dx, dy, dw, dh);

        if (flip_x || flip_y) offscreen_ctx.setTransform(1, 0, 0, 1, 0, 0);
        continue;
      }
      const { txt, txt_fill = 'white', txt_stroke, font = ['16px', 'Arial'] } = layout;
      if (is_str(txt)) {
        const [l, t] = layout._left_top;
        const x = screen_w * l / f_w;
        const y = screen_h * t / f_h;

        if (txt_fill) {
          offscreen_ctx.fillStyle = txt_fill;
          offscreen_ctx.font = font.join(' ');
          offscreen_ctx.fillText(txt, x, y);
        }
        if (txt_stroke) {
          offscreen_ctx.strokeStyle = txt_stroke;
          offscreen_ctx.fillText(txt, x, y);
        }
      }
    }
    onscreen_ctx.drawImage(offscreen, 0, 0);
  }, [layouts, lf2]);

  useEffect(() => {
    offscreen_ref.current = document.createElement('canvas');
  }, []);

  const cook_layouts = useCallback(async () => {
    if (!lf2) return;

    const get_val = (word: string) => (layout: ICookedLayoutInfo) => {
      if (word === 'mouse_on_me') {
        const [x, y] = layout._left_top;
        const [w, h] = layout._size;
        return (
          x <= mem.current.mouse_x
          && y <= mem.current.mouse_y
          && x + w >= mem.current.mouse_x
          && y + h >= mem.current.mouse_y
        ) ? '1' : '0';
      }
      return word;
    };

    const layouts: ICookedLayoutInfo[] = [];
    const arithmetic_progression_map = new Map<string, number[]>();
    for (const raw_layout of raw_layouts_list[www]) {
      const { visible, img, which } = raw_layout;
      let img_idx: number | undefined;
      if (is_str(which)) {
        const result = which.trim().replace(/\s/g, '').match(/random_int_in_range\((\d+),(\d+)(,\d+)?\)/);
        if (result) {
          const [, a, b, group_id] = result;
          const begin = Number(a);
          const end = Number(b);
          if (begin < end) {
            let arr: number[] = [];
            if (is_str(group_id)) {
              const r = arithmetic_progression_map.get(group_id)
              if (r?.length) arr = r;
              else arithmetic_progression_map.set(group_id, arr = arithmetic_progression(begin, end, 1))
            } else {
              arr = arithmetic_progression(begin, end, 1)
            }
            img_idx = random_take(arr);
          }
        }
      }
      const img_path = !is_arr(img) ? img : is_num(img_idx) ? img[img_idx] : random_get(img);


      const preload = async (img_path: string) => {
        const img_info = image_pool.find(img_path);
        if (img_info) return img_info;
        const img_url = await lf2.import(img_path);
        return await image_pool.load(img_path, img_url);
      };
      const _img = img_path ? await preload(img_path) : void 0;
      const [sx = 0, sy = 0, sw = 0, sh = 0] = raw_layout.s_rect ?? [0, 0, _img?.w, _img?.h];
      let [w, h] = raw_layout.size ?? [0, 0];
      const [cx, cy] = raw_layout.center ?? [0, 0];
      const [x, y] = raw_layout.pos ?? [0, 0];
      w = (w === 0) ? h * sw / sh : w;
      h = (h === 0) ? w * sh / sw : h;

      const cooked: ICookedLayoutInfo = {
        ...raw_layout,
        _visible: () => true,
        _img,
        _left_top: [x - cx, y - cy],
        _size: [w, h],
        _s_rect: [sx, sy, sw, sh],
      };
      if (is_bool(visible)) {
        cooked._visible = () => visible;
      } else if (is_str(visible)) {
        const cond = new Condition<ICookedLayoutInfo>(visible, get_val);
        cooked._visible = cond.make();
      }
      layouts.push(cooked);
    }
    set_layouts(layouts);
  }, [raw_layouts_list, lf2]);

  useEffect(() => {
    cook_layouts();
  }, [cook_layouts]);

  useEffect(() => {
    if (!lf2) return;
    const render_once = () => {
      draw_ui();
      requestAnimationFrame(render_once);
    };
    requestAnimationFrame(render_once);
  }, [lf2, draw_ui]);

  const onPointerDown = (e: React.PointerEvent) => {
    if (e.isPrimary) mem.current.pointer_down = true;
  };
  const onPointerMove = (e: React.PointerEvent) => {
    if (!e.isPrimary) return;

    const canvas = canvas_ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.getTransform();
    const { x, y, width, height } = canvas.getBoundingClientRect();
    const p = screen_2_canvas(ctx, { x: e.pageX - x, y: e.pageY - y });
    mem.current.mouse_x = p.x * f_w / width;
    mem.current.mouse_y = p.y * f_h / height;
  };
  const onPointerUp = (e: React.PointerEvent) => {
    if (e.isPrimary) mem.current.pointer_down = false;
  };
  return (
    <canvas
      ref={canvas_ref}
      className='game_ui_canvas'
      width={795}
      height={450}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerUp} />
  );
}

export interface ILayoutInfo {
  key: string;
  img?: string[] | string;
  which?: number | string;
  s_rect?: number[];
  center?: number[];
  pos?: number[];
  size?: number[];
  visible?: boolean | string;
  flip_x?: boolean;
  flip_y?: boolean

  txt?: string;
  txt_fill?: string;
  txt_stroke?: string;
  font?: string[];

}
export interface ICookedLayoutInfo extends ILayoutInfo {
  _img?: TImageInfo;
  _s_rect: [number, number, number, number];
  _visible: (layout: ICookedLayoutInfo) => boolean;
  _left_top: [number, number];
  _size: [number, number];
}
const canvas_2_screen = (ctx: CanvasRenderingContext2D, { x, y }: { x: number, y: number }) => {
  const matrix = ctx.getTransform().invertSelf()
  if (!matrix.is2D) return { x: NaN, y: NaN }
  const { a, b, c, d, e, f } = matrix
  const screenX = (c * y - d * x + d * e - c * f) / (b * c - a * d)
  const screenY = (y - screenX * b - f) / d
  return {
    x: Math.round(screenX),
    y: Math.round(screenY),
  }
}

const screen_2_canvas = (ctx: CanvasRenderingContext2D, { x, y }: { x: number, y: number }) => {
  const matrix = ctx.getTransform().invertSelf()
  if (!matrix.is2D) return { x: NaN, y: NaN }
  const { a, b, c, d, e, f } = matrix
  return {
    x: Math.round(x * a + y * c + e),
    y: Math.round(x * b + y * d + f)
  };
}
const is_arr = (arg: any): arg is any[] => Array.isArray(arg)
