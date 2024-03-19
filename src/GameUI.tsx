import { useCallback, useEffect, useRef, useState } from 'react';
import LF2 from './LF2/LF2';
import { Condition } from './LF2/loader/Condition';
import { TImageInfo, image_pool } from './LF2/loader/loader';
import random_take from './Utils/random_take';
import { arithmetic_progression } from './js_utils/arithmetic_progression';
import { is_bool } from './js_utils/is_bool';
import { is_num } from './js_utils/is_num';
import { is_str } from './js_utils/is_str';
export interface ILayoutItem {
  key: string;
  img?: string[] | string;
  img_idx?: number;
  which?: number | string;
  s_rect?: number[];
  center?: number[];
  pos?: number[];
  size?: number[];
  visible?: boolean | string;
  flip_x?: boolean;
  flip_y?: boolean
  bg_color?: string;

  txt?: string;
  txt_fill?: string;
  txt_stroke?: string;
  font?: string[];
  on_click?: string;
}
export interface ILayoutData {
  name: string;
  id: string;
  bg_color?: string;
  items: ILayoutItem[];
  key_press_events?: [string, string][],
}
export interface ICookedLayoutItem extends ILayoutItem {
  _img?: TImageInfo[];
  _img_idx?: (layout: ICookedLayoutItem) => number;
  _s_rect: [number, number, number, number];
  _visible: (layout: ICookedLayoutItem) => boolean;
  _left_top: [number, number];
  _size: [number, number];
  _layout: ICookedLayoutData;
}
export interface ICookedLayoutData extends ILayoutData {
  items: ICookedLayoutItem[]
}
const pos_on_me = (item: ICookedLayoutItem, x: number, y: number) => {
  const [l, t] = item._left_top;
  const [w, h] = item._size;
  return l <= x && t <= y && l + w >= x && t + h >= y;
}

const f_w = 794;
const f_h = 450;
const raw_layouts: ILayoutData[] = [
  {
    name: 'entry_page',
    id: 'entry',
    bg_color: 'rgb(16, 32, 108)',
    items: [{
      key: 'bg_left',
      which: 'random_int_in_range(0,12,1)',
      img: arithmetic_progression(1, 13, 1).map(n => `sprite/MENU_BACK${n}.png`),
      size: [0, f_h],
    }, {
      key: 'bg_right',
      which: 'random_int_in_range(0,12,1)',
      img: arithmetic_progression(1, 13, 1).map(n => `sprite/MENU_BACK${n}.png`),
      size: [0, f_h],
      center: [1, 0],
      pos: [f_w, 0],
      flip_x: true,
    }, {
      key: 'main_title',
      img: 'sprite/MENU_CLIP.png',
      s_rect: [0, 41, 496, 80],
      center: [0.5, 0],
      size: [496, 80],
      pos: [796 / 2, 40]
    }, {
      key: 'main_menu',
      img: 'sprite/MENU_CLIP.png',
      s_rect: [0, 125, 282, 119],
      center: [0.5, 0.5],
      size: [282, 119],
      pos: [397, 270]
    }, {
      visible: 'mouse_on_me==1',
      key: 'start_local_game',
      img: 'sprite/MENU_CLIP.png',
      s_rect: [535, 105, 256, 26],
      center: [0.5, 0],
      size: [256, 26],
      pos: [796 / 2, 270 - 60 + 14],
      on_click: 'goto(loading)'
    }, {
      visible: 'mouse_on_me==1',
      key: 'network_game',
      img: 'sprite/MENU_CLIP.png',
      s_rect: [535, 137, 256, 26],
      center: [0.5, 0],
      size: [256, 26],
      pos: [796 / 2, 270 - 60 + 46],
      on_click: 'alert(还没想好呢)'
    }, {
      visible: 'mouse_on_me==1',
      key: 'ctrl_settings',
      img: 'sprite/MENU_CLIP.png',
      s_rect: [535, 168, 256, 26],
      center: [0.5, 0],
      size: [256, 26],
      pos: [796 / 2, 270 - 60 + 77],
      on_click: 'goto(ctrl_settings)'
    }]
  },
  {
    name: 'loading_page',
    id: 'loading',
    bg_color: 'rgb(16, 32, 108)',
    key_press_events: [['escape', 'goto(entry)']],
    items: [{
      key: 'bg_wait',
      img: 'sprite/MENU_WAIT.png',
      size: [f_w, 0],
    }, {
      key: 'txt_loading_content',
      txt: 'txt_loading_content',
      txt_fill: 'white',
      pos: [610, 75],
      font: ['16px', 'Arial']
    }]
  },
  {
    name: 'ctrl_settings_page',
    id: 'ctrl_settings',
    bg_color: 'rgb(16, 32, 108)',
    key_press_events: [['escape', 'goto(entry)']],
    items: [
      {
        key: 'bg_left',
        which: 'random_int_in_range(0,12,1)',
        img: arithmetic_progression(1, 13, 1).map(n => `sprite/MENU_BACK${n}.png`),
        s_rect: [0, 0, 378, 546],
        size: [0, f_h],
      }, {
        key: 'bg_right',
        which: 'random_int_in_range(0,12,1)',
        img: arithmetic_progression(1, 13, 1).map(n => `sprite/MENU_BACK${n}.png`),
        s_rect: [0, 0, 378, 546],
        center: [1, 0],
        size: [0, f_h],
        pos: [f_w, 0],
        flip_x: true,
      }, {
        key: 'main_title',
        img: 'sprite/MENU_CLIP.png',
        s_rect: [0, 41, 496, 80],
        center: [0.5, 0],
        size: [496 * .75, 80 * .75],
        pos: [796 / 2, 5]
      }, {
        key: 'main_menu',
        img: 'sprite/MENU_CLIP2.png',
        s_rect: [0, 0, 704, 353],
        center: [0.5, 0.5],
        size: [704, 353],
        pos: [397, 270 - 15]
      }, {
        visible: 'mouse_on_me==1',
        key: 'btn_confirm',
        img: 'sprite/MENU_CLIP.png',
        s_rect: [489, 426, 151, 26],
        pos: [407, 414 - 15],
        on_click: 'goto(entry)'
      }, {
        visible: 'mouse_on_me==1',
        key: 'btn_cancel',
        img: 'sprite/MENU_CLIP.png',
        s_rect: [643, 426, 151, 26],
        pos: [579, 414 - 15],
        on_click: 'goto(entry)'
      }, {
        visible: 'mouse_on_me==0',
        key: 'move_table_normal',
        img: 'sprite/MENU_CLIP2.png',
        s_rect: [0, 354, 494, 23],
        center: [0, 1],
        pos: [0, 450],
      }, {
        visible: 'mouse_on_me==1',
        key: 'move_table_hover',
        img: 'sprite/MENU_CLIP2.png',
        s_rect: [0, 379, 494, 23],
        center: [0, 1],
        pos: [0, 450],
        on_click: 'link_to(https://lf2.net/control.html)'
      }, {
        key: 'move_table_hover',
        img: ['sprite/CS6.png', 'sprite/CS2.png', 'sprite/CS3.png', 'sprite/CS4.png', 'sprite/CS5.png'],
        pos: [193, 155 - 15],
        on_click: 'loop_img'
      }, {
        key: 'move_table_hover',
        img: ['sprite/CS6.png', 'sprite/CS2.png', 'sprite/CS3.png', 'sprite/CS4.png', 'sprite/CS5.png'],
        pos: [193 + 139, 155 - 15],
        on_click: 'loop_img'
      }, {
        key: 'move_table_hover',
        img: ['sprite/CS6.png', 'sprite/CS2.png', 'sprite/CS3.png', 'sprite/CS4.png', 'sprite/CS5.png'],
        pos: [193 + 139 * 2, 155 - 15],
        on_click: 'loop_img'
      }, {
        key: 'move_table_hover',
        img: ['sprite/CS6.png', 'sprite/CS2.png', 'sprite/CS3.png', 'sprite/CS4.png', 'sprite/CS5.png'],
        pos: [193 + 139 * 3, 155 - 15],
        on_click: 'loop_img'
      }]
  }
]
export function GameUI(props: { lf2?: LF2; }) {
  const { lf2 } = props;
  const canvas_ref = useRef<HTMLCanvasElement>(null);
  const offscreen_ref = useRef<HTMLCanvasElement | null>(null);
  const mem = useRef({ pointer_down: false, mouse_x: NaN, mouse_y: NaN });
  const [cooked_layouts, set_cooked_layouts] = useState<ICookedLayoutData[]>([]);
  const [layout, set_layout] = useState<ICookedLayoutData>();

  const draw_ui = useCallback(async () => {
    if (!layout) return;
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
    }
    offscreen_ctx.fillStyle = layout.bg_color ?? 'black';
    offscreen_ctx.fillRect(0, 0, screen_w, screen_h);

    for (const item of layout.items) {
      const { _visible, _img, flip_x, flip_y, bg_color, _img_idx } = item;
      if (!_visible(item)) continue;

      const [w, h] = item._size;
      const [l, t] = item._left_top;
      const dx = Math.floor(screen_w / f_w * l)
      const dy = Math.floor(screen_h / f_h * t)
      const dw = Math.floor(screen_w / f_w * w)
      const dh = Math.floor(screen_h / f_h * h)
      if (_img?.length) {
        const img_idx = _img_idx?.(item) ?? 0
        if (img_idx < 0 || img_idx >= _img.length) continue;
        if (flip_x || flip_y) {
          offscreen_ctx.translate(
            flip_x ? 2 * dx + dw : 0,
            flip_y ? 2 * dy + dh : 0
          );
          offscreen_ctx.scale(
            flip_x ? -1 : 1,
            flip_y ? -1 : 1
          );
        }
        offscreen_ctx.drawImage(_img[img_idx].img_ele, ...item._s_rect, dx, dy, dw, dh);
        if (flip_x || flip_y) offscreen_ctx.setTransform(1, 0, 0, 1, 0, 0);
      }
      if (bg_color) {
        offscreen_ctx.fillStyle = bg_color;
        offscreen_ctx.fillRect(dx, dy, dw, dh);
      }

      const { txt, txt_fill = 'white', txt_stroke, font = ['16px', 'Arial'] } = item;
      if (is_str(txt)) {
        const [l, t] = item._left_top;
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
  }, [layout, lf2]);

  useEffect(() => {
    offscreen_ref.current = document.createElement('canvas');
  }, []);

  const cook_layouts = useCallback(async () => {
    if (!lf2) return;
    const get_val = (word: string) => (item: ICookedLayoutItem) => {
      if (word === 'mouse_on_me') {
        const { mouse_x: x, mouse_y: y } = mem.current;
        return pos_on_me(item, x, y) ? '1' : '0';
      }
      return word;
    };

    const cooked_layouts: ICookedLayoutData[] = [];
    for (const raw_layout of raw_layouts) {
      const cooked_layout: ICookedLayoutData = { ...raw_layout, items: [] }
      const arithmetic_progression_map = new Map<string, number[]>();
      for (const raw_items of raw_layout.items) {
        const { visible, img, which } = raw_items;
        const img_paths = !is_arr(img) ? [img] : img;
        const _img: TImageInfo[] = [];
        const preload = async (img_path: string) => {
          const img_info = image_pool.find(img_path);
          if (img_info) return img_info;
          const img_url = await lf2.import(img_path);
          return await image_pool.load(img_path, img_url);
        };
        let img_idx: number = 0;
        if (is_str(which)) {
          const trimed = which.trim().replace(/\s/g, '')
          const result = trimed.match(/random_int_in_range\((\d+),(\d+)(,\d+)?\)/);
          if (result) {
            const [, a, b, group_id] = result;
            const begin = Number(a);
            const end = Number(b);
            if (begin < end) {
              let arr: number[] = [];
              if (is_str(group_id)) {
                const r = arithmetic_progression_map.get(trimed)
                if (r?.length) arr = r;
                else arithmetic_progression_map.set(trimed, arr = arithmetic_progression(begin, end, 1))
              } else {
                arr = arithmetic_progression(begin, end, 1)
              }
              img_idx = random_take(arr);
            }
          }
        } else if (is_num(which)) {
          img_idx = which % (img?.length || 0);
        }
        const _img_idx = () => img_idx;
        for (const p of img_paths) {
          if (!p) continue
          _img.push(await preload(p))
        }

        const [sx = 0, sy = 0, sw = 0, sh = 0] = raw_items.s_rect ?? [0, 0, _img[0]?.w, _img[0]?.h];
        const [w = 0, h = 0] = raw_items.size ?? [sw, sh];
        const [cx, cy] = raw_items.center ?? [0, 0];
        const [x, y] = raw_items.pos ?? [0, 0];
        const _size: [number, number] = [
          Math.floor((w === 0) ? h * sw / sh : w),
          Math.floor((h === 0) ? w * sh / sw : h)
        ];

        let _visible = (_: ICookedLayoutItem) => true
        if (is_bool(visible)) {
          _visible = () => visible;
        } else if (is_str(visible)) {
          const cond = new Condition<ICookedLayoutItem>(visible, get_val);
          _visible = cond.make();
        }

        const cooked_item: ICookedLayoutItem = {
          ...raw_items,
          _visible,
          _img,
          _left_top: [x - Math.floor(cx * _size[0]), y - Math.floor(cy * _size[1])],
          _size,
          _s_rect: [sx, sy, sw, sh],
          _layout: cooked_layout,
          _img_idx,
          on_click: raw_items.on_click?.trim().replace(/\s/g, '')
        };
        cooked_layout.items.push(cooked_item);
      }
      cooked_layouts.push(cooked_layout)
    }
    set_cooked_layouts(cooked_layouts);
    set_layout(cooked_layouts[0]);
  }, [lf2]);

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

  const update_mouse_pos = (e: React.PointerEvent) => {
    const canvas = canvas_ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.getTransform();
    const { x, y, width, height } = canvas.getBoundingClientRect();
    const p = screen_2_canvas(ctx, { x: e.pageX - x, y: e.pageY - y });
    mem.current.mouse_x = p.x * f_w / width;
    mem.current.mouse_y = p.y * f_h / height;
  }
  const onPointerDown = (e: React.PointerEvent) => {
    if (!e.isPrimary) return;
    mem.current.pointer_down = true;
    update_mouse_pos(e)
  };
  const onPointerMove = (e: React.PointerEvent) => {
    if (!e.isPrimary) return;
    update_mouse_pos(e)
  };
  const onPointerUp = (e: React.PointerEvent) => {
    if (!e.isPrimary) return;
    mem.current.pointer_down = false;
    update_mouse_pos(e)
  };
  const onKeyDown = (e: React.KeyboardEvent) => {
    if (!layout) return;
    console.log(layout, e.key.toLowerCase())
    const { key_press_events = [] } = layout;
    for (const [key, action] of key_press_events) {
      console.log(key, e.key.toLowerCase())
      if (e.key.toLowerCase() !== key) continue
      handle_layout_action(layout, action)
    }
  }
  const handle_layout_action = (layout: ICookedLayoutData, action: string) => {
    const [, next_layout_id] = action.match(/goto\((.+)\)/) ?? []
    if (next_layout_id) {
      const next_layout = cooked_layouts.find(v => v.id === next_layout_id)
      set_layout(next_layout)
      return;
    }
    const [, alert_msg] = action.match(/alert\((.+)\)/) ?? []
    if (alert_msg) {
      alert(alert_msg);
      return;
    }
    const [, url] = action.match(/link_to\((.+)\)/) ?? [];
    if (url) window.open(url)
  }
  const handle_item_action = (item: ICookedLayoutItem, action: string) => {
    if (action === 'loop_img') {
      const img_idx = is_num(item.which) ? item.which : 0
      item._img_idx = () => item.which = (img_idx + 1) % (item._img?.length ?? 0)
      return;
    }
    handle_layout_action(item._layout, action)
  }
  const onClick = (e: React.MouseEvent) => {
    if (!layout) return;
    for (const item of layout.items) {
      const { on_click } = item;
      if (!on_click) continue;
      const { mouse_x: x, mouse_y: y } = mem.current;
      const on_me = pos_on_me(item, x, y);
      if (on_me) handle_item_action(item, on_click)

    }
  }
  return (
    <canvas
      ref={canvas_ref}
      className='game_ui_canvas'
      tabIndex={-1}
      width={794}
      height={450}
      onKeyDown={onKeyDown}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerUp}
      onClick={onClick} />
  );
}


const canvas_2_screen = (ctx: CanvasRenderingContext2D, { x, y }: { x: number, y: number }) => {
  const matrix = ctx.getTransform().invertSelf()
  if (!matrix.is2D) return { x: NaN, y: NaN }
  const { a, b, c, d, e, f } = matrix
  const screenX = (c * y - d * x + d * e - c * f) / (b * c - a * d)
  const screenY = (y - screenX * b - f) / d
  return {
    x: Math.floor(screenX),
    y: Math.floor(screenY),
  }
}

const screen_2_canvas = (ctx: CanvasRenderingContext2D, { x, y }: { x: number, y: number }) => {
  const matrix = ctx.getTransform().invertSelf()
  if (!matrix.is2D) return { x: NaN, y: NaN }
  const { a, b, c, d, e, f } = matrix
  return {
    x: Math.floor(x * a + y * c + e),
    y: Math.floor(x * b + y * d + f)
  };
}
const is_arr = (arg: any): arg is any[] => Array.isArray(arg)
