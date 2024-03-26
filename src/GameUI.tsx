import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import LF2 from './LF2/LF2';
import { random_in_range } from './LF2/random_in_range';
import random_take from './Utils/random_take';
import { arithmetic_progression } from './js_utils/arithmetic_progression';
import { is_num } from './js_utils/is_num';
import { is_str } from './js_utils/is_str';

import { Layout } from './Layout';
import { is_arr } from './is_arr';


const f_w = 794;
const f_h = 450;

export function GameUI(props: { lf2?: LF2; load_builtin?: () => void }) {
  const { lf2 } = props;
  const canvas_ref = useRef<HTMLCanvasElement>(null);
  const off_canvas = useMemo(() => document.createElement('canvas'), []);

  const mem = useRef({ pointer_down: false, mouse_x: NaN, mouse_y: NaN });
  const [cooked_layouts, set_cooked_layouts] = useState<Layout[]>([]);
  const [layout, set_layout] = useState<Layout>();

  const val_getter = (word: string) => (item: Layout) => {
    if (word === 'mouse_on_me') {
      const { mouse_x: x, mouse_y: y } = mem.current;
      return item.hit(x, y) ? '1' : '0';
    }
    if (word.startsWith('f:')) {
      const result = word.match(/f:random_int_in_range\((\d+),(\d+)(,\d+)?\)/);
      if (result) {
        const [, a, b, group_id] = result;
        const begin = Number(a);
        const end = Number(b);
        if (begin > end) return end;
        const { img_idx } = item.state;
        if (is_num(img_idx)) return img_idx

        if (is_str(group_id) && item.parent) {
          let arr = item.parent.state['random_int_arr' + group_id];
          if (!is_arr(arr) || !arr.length)
            arr = item.parent.state['random_int_arr' + group_id] = arithmetic_progression(begin, end, 1);
          return item.state.img_idx = random_take(arr);
        } else {
          return item.state.img_idx = Math.floor(random_in_range(begin, end) % (end + 1))
        }
      }
    }
    return word;
  };
  useEffect(() => {
    if (!lf2) return;
  }, [lf2])

  const draw_ui = useCallback(async () => {
    if (!layout) return;
    const canvas = canvas_ref.current;
    const onscreen_ctx = canvas?.getContext('2d');
    const off_ctx = off_canvas.getContext('2d');

    if (!canvas || !off_canvas || !off_ctx || !onscreen_ctx || !lf2) return;

    const { width, height } = canvas;
    const screen_w = Math.floor(width);
    const screen_h = Math.floor(height);

    if (off_canvas.width !== screen_w || off_canvas.height !== screen_h) {
      off_canvas.width = screen_w;
      off_canvas.height = screen_h;
    }
    off_ctx.fillStyle = layout.data.bg_color ?? 'black';
    off_ctx.fillRect(0, 0, screen_w, screen_h);

    for (const item of layout.items) {
      const { flip_x, flip_y, bg_color } = item.data;
      const { visible, img_infos, img_idx } = item;
      if (!visible) continue;
      const [l, t, w, h] = item.dst_rect;
      const dx = Math.floor(screen_w / f_w * l)
      const dy = Math.floor(screen_h / f_h * t)
      const dw = Math.floor(screen_w / f_w * w)
      const dh = Math.floor(screen_h / f_h * h)
      if (img_infos?.length) {

        if (img_idx < 0 || img_idx >= img_infos.length) continue;
        if (flip_x || flip_y) {
          off_ctx.translate(
            flip_x ? 2 * dx + dw : 0,
            flip_y ? 2 * dy + dh : 0
          );
          off_ctx.scale(
            flip_x ? -1 : 1,
            flip_y ? -1 : 1
          );
        }
        off_ctx.drawImage(img_infos[img_idx].img, dx, dy, dw, dh);
        if (flip_x || flip_y) off_ctx.setTransform(1, 0, 0, 1, 0, 0);
      }
      if (bg_color) {
        off_ctx.fillStyle = bg_color;
        off_ctx.fillRect(dx, dy, dw, dh);
      }

      const { txt, txt_fill = 'white', txt_stroke, font = ['16px', 'Arial'] } = item.data;
      if (is_str(txt)) {
        if (txt_fill) {
          off_ctx.fillStyle = txt_fill;
          off_ctx.font = font.join(' ');
          off_ctx.fillText(txt, dx, dy);
        }
        if (txt_stroke) {
          off_ctx.strokeStyle = txt_stroke;
          off_ctx.fillText(txt, dx, dy);
        }
      }
    }
    onscreen_ctx.drawImage(off_canvas, 0, 0);
  }, [layout, lf2, off_canvas]);


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
    const { key_press_actions: key_press_events = [] } = layout.data;
    for (const [key, action] of key_press_events) {
      if (e.key.toLowerCase() !== key) continue
      handle_layout_action(layout, action)
    }
  }
  const handle_layout_action = (layout: Layout, action: string) => {
    const [, next_layout_id] = action.match(/goto\((.+)\)/) ?? []

    if (action === 'loop_img')
      return layout.to_next_img();
    if (action === 'cancel_load_data')
      return lf2?.clear()

    if (action === 'load_default_data')
      return props.load_builtin?.();

    if (next_layout_id) {
      const prev_layout = layout;
      const next_layout = cooked_layouts.find(v => v.data.id === next_layout_id)
      if (prev_layout?.data.actions?.leave) handle_layout_action(prev_layout, prev_layout.data.actions.leave)
      if (next_layout?.data.actions?.enter) handle_layout_action(next_layout, next_layout.data.actions.enter)
      prev_layout.on_unmount();
      next_layout?.on_mount();
      return set_layout(next_layout)
    }

    const [, alert_msg] = action.match(/alert\((.+)\)/) ?? []
    if (alert_msg) return alert(alert_msg);

    const [, url] = action.match(/link_to\((.+)\)/) ?? [];
    if (url) return window.open(url)
  }

  const onClick = (e: React.MouseEvent) => {
    if (!layout) return;
    for (const item of layout.items) {
      const { click: a } = item.data.actions || {};
      if (!a) continue;
      const { mouse_x: x, mouse_y: y } = mem.current;
      item.hit(x, y) && handle_layout_action(item, a)
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

