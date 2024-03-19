import JSZIP from 'jszip';
import { useCallback, useEffect, useRef, useState } from 'react';
import './App.css';
import { BlackgroundRow } from './BlackgroundRow';
import Fullsreen from './Fullsreen';
import LF2 from './LF2/LF2';
import Stage from './LF2/Stage';
import { Character } from './LF2/entity/Character';
import { Condition } from './LF2/loader/Condition';
import { TImageInfo, image_pool } from './LF2/loader/loader';
import { Log } from './Log';
import { PlayerRow } from './PlayerRow';
import open_file, { read_file } from './Utils/open_file';
import random_get from './Utils/random_get';
import './game_ui.css';
import './init';
import { arithmetic_progression } from './js_utils/arithmetic_progression';
import { is_bool } from './js_utils/is_bool';
import { is_str } from './js_utils/is_str';
import lf2_dat_str_to_json from './js_utils/lf2_dat_translator/dat_2_json';
import read_lf2_dat from './read_lf2_dat';

const fullsreen = new Fullsreen();
function App() {
  const _overlay_ref = useRef<HTMLDivElement>(null)
  const _canvas_ref = useRef<HTMLCanvasElement>(null)
  const _game_contiainer_ref = useRef<HTMLDivElement>(null)

  const _text_area_dat_ref = useRef<HTMLTextAreaElement>(null);
  const _text_area_json_ref = useRef<HTMLTextAreaElement>(null);
  const [lf2, set_lf2] = useState<LF2>();
  const [editor_closed, set_editor_closed] = useState(true);
  const [game_overlay, set_game_overlay] = useState(true);
  const [control_panel, set_control_panel] = useState(true);
  const [cur_stage, set_cur_stage] = useState<Stage>();
  const [cur_character, set_cur_character] = useState<Character>();
  const [loading, set_loading] = useState(false);
  const [loaded, set_loaded] = useState(false);

  const [paused, set_paused] = useState(false);
  useEffect(() => {
    if (!lf2) return;
    lf2.world.paused = paused;
  }, [lf2, paused])

  const update_once = useCallback(() => {
    set_paused(true);
    lf2?.world.update_once()
  }, [lf2])

  const [show_indicators, set_show_indicators] = useState(false);
  useEffect(() => {
    if (!lf2) return;
    lf2.world.show_indicators = show_indicators;
  }, [lf2, show_indicators])

  const [fast_forward, set_fast_forward] = useState(false);
  useEffect(() => {
    if (!lf2) return;
    lf2.world.playrate = fast_forward ? 100 : 1;
  }, [lf2, fast_forward])


  const toggle_fullscreen = () => {
    if (fullsreen.enabled())
      fullsreen.exit();
    else
      fullsreen.enter(_game_contiainer_ref.current!);
  }


  useEffect(() => {
    if (!lf2 || !loaded) return;
    const on_key_down = (e: KeyboardEvent) => {
      const interrupt = () => {
        e.stopPropagation();
        e.preventDefault();
        e.stopImmediatePropagation();
      }
      switch (e.key?.toUpperCase()) {
        case 'F2':
          interrupt();
          update_once()
          break;
        case 'F1':
          interrupt();
          set_paused(v => !v)
          break;
        case 'F5':
          interrupt();
          set_fast_forward(v => !v);
          break;
        case 'F6':
          interrupt();
          set_show_indicators(v => !v)
          break;
        case 'F7':
          interrupt();
          set_game_overlay(v => !v)
          break;
        case 'F8':
          interrupt();
          set_control_panel(v => !v)
          break;
        case 'F9':
          interrupt();
          toggle_fullscreen();
          break;
      }
    }

    window.addEventListener('keydown', on_key_down);
    return () => window.removeEventListener('keydown', on_key_down)
  }, [lf2, loaded, update_once])

  useEffect(() => {
    const canvas = _canvas_ref.current;
    const overlay = _overlay_ref.current;
    if (!canvas) return;
    if (!lf2) {
      const lf2 = new LF2(canvas, overlay);
      Object.defineProperty(window, 'lf2', { value: lf2, configurable: true })
      set_lf2(lf2);
      lf2.world.callbacks.add({
        on_stage_change: (_, s) => set_cur_stage(s)
      })
      lf2.on_click_character = c => set_cur_character(c)
      return () => { lf2.dispose() }
    }
  }, [lf2]);

  const on_click_load_local_zip = () => {
    if (!lf2) return;
    set_loading(true);
    open_file({ accept: '.zip' })
      .then(v => v[0])
      .then(v => JSZIP.loadAsync(v))
      .then(v => lf2.start(v))
      .then(_ => set_loaded(true))
      .catch(e => Log.print('on_click_load_local_zip', e))
      .finally(() => set_loading(false))
  }
  const on_click_load_builtin_zip = () => {
    if (!lf2) return;
    set_loading(true);
    fetch('lf2.data.zip')
      .then(v => v.blob())
      .then(v => JSZIP.loadAsync(v))
      .then(v => lf2.start(v))
      .then(_ => set_loaded(true))
      .catch(e => Log.print('on_click_load_builtin_zip', e))
      .finally(() => set_loading(false))
  }
  const on_click_cleaup = () => {
    if (!lf2) return;
    lf2.dispose();
    set_lf2(void 0);
    set_loaded(false);
  }
  const on_click_load_builtin = async () => {
    if (!lf2) return;
    set_loading(true);
    lf2.start()
      .then(_ => set_loaded(true))
      .catch(e => Log.print('on_click_load_builtin', e))
      .finally(() => set_loading(false))
  }
  const open_dat = async () => {
    const [file] = await open_file({ accept: '.dat' });
    const buf = await read_file(file, { as: 'ArrayBuffer' });
    return read_lf2_dat(buf)
  }
  const on_click_read_dat = () => {
    set_loading(true);
    open_dat().then((str) => {
      if (_text_area_dat_ref.current)
        _text_area_dat_ref.current.value = str
      Log.print('App', "dat length", str.length);
      return str;
    }).then((str) => {
      return lf2_dat_str_to_json(str);
    }).then((data) => {
      Log.print('App', "json length", JSON.stringify(data).replace(/\\\\/g, '/').length);
      if (_text_area_json_ref.current)
        _text_area_json_ref.current.value = JSON.stringify(data, null, 2).replace(/\\\\/g, '/')
    }).catch(e => {
      console.error(e)
    }).finally(() => {
      set_loading(false)
    })
  }

  return (
    <div className="App">
      <div className='top_row'>
        <button onClick={on_click_load_local_zip} disabled={loading || loaded}>加载本地ZIP</button>
        <button onClick={on_click_load_builtin_zip} disabled={loading || loaded}>加载默认ZIP</button>
        <button onClick={on_click_load_builtin} disabled={loading || loaded}>加载默认数据</button>
        <button onClick={on_click_cleaup} disabled={loading || !loaded}>清空数据</button>
        <button onClick={() => set_editor_closed(false)}>dat viewer</button>
      </div>
      {
        loaded ? <>
          <div className='top_row'>
            <button onClick={() => set_paused(v => !v)}>{paused ? 'resume' : 'pause'}(F1)</button>
            <button onClick={() => update_once()}>update_once(F2)</button>
            <button onClick={() => set_fast_forward(v => !v)}>{fast_forward ? 'normal' : 'unlimited'} speed(F5)</button>
            <button onClick={() => set_show_indicators(v => !v)}>{show_indicators ? 'hide' : 'show'} indicators(F6)</button>
            <button onClick={() => set_game_overlay(v => !v)}>{game_overlay ? 'hide' : 'show '} game overlay(F7)</button>
            <button onClick={() => set_control_panel(v => !v)}>{control_panel ? 'hide' : 'show '} control panel(F8)</button>
            <button onClick={() => toggle_fullscreen()}>fullscreen(F8)</button>
          </div>

          {[1, 2, 3, 4].map(v => <PlayerRow key={v} which={v} lf2={lf2} visible={control_panel} />)}
          <BlackgroundRow lf2={lf2} visible={control_panel} />
        </> : null
      }
      <div className='game_contiainer' ref={_game_contiainer_ref}>
        <canvas tabIndex={-1} ref={_canvas_ref} className='game_canvas' width={795} height={450} />
        <div className='game_overlay' ref={_overlay_ref} style={{ display: !game_overlay ? 'none' : void 0 }} />
        <div className='game_ui'>
          <GameUI lf2={lf2} />
        </div>
      </div>
      <div className='editor_view' style={{ display: editor_closed ? 'none' : void 0 }}>
        <div className='top'>
          <button onClick={() => set_editor_closed(true)} disabled={loading}>close</button>
          <button onClick={on_click_read_dat} disabled={loading}>read_dat</button>
        </div>
        <div className='main'>
          <textarea ref={_text_area_dat_ref} wrap="off" />
          <textarea ref={_text_area_json_ref} wrap="off" />
        </div>
      </div>
    </div >
  );
}


interface ILayoutInfo {
  key: string;
  img: string[] | string;
  s_rect?: number[];
  center?: number[];
  pos?: number[];
  size?: number[];
  visible?: boolean | string;
}
interface ICookedLayoutInfo extends ILayoutInfo {
  _img: TImageInfo;
  _visible: (layout: ICookedLayoutInfo) => boolean;
  _left_top: [number, number];
  _size: [number, number];
  _s_rect: [number, number, number, number];
}


function GameUI(props: { lf2?: LF2 }) {
  const { lf2 } = props;
  const canvas_ref = useRef<HTMLCanvasElement>(null);
  const offscreen_ref = useRef<HTMLCanvasElement | null>(null);
  const mem = useRef({
    pointer_down: false,
    mouse_x: NaN,
    mouse_y: NaN,
  });
  const f_w = 796;
  const f_h = 450;
  const menu_w = 282
  const menu_h = 119
  const menu_x = Math.floor(f_w / 2);
  const menu_y = Math.floor(f_h / 2);
  const menu_cx = Math.floor(menu_w / 2);
  const menu_cy = Math.floor(menu_h / 2);

  const [raw_layouts, set_raw_layouts] = useState<ILayoutInfo[]>([{
    // visible: false,
    key: 'bg_left',
    img: arithmetic_progression(1, 13, 1).map(n => `sprite/MENU_BACK${n}.png`),
    s_rect: [0, 0, 378, 546],
    size: [0, 450],
  }, {
    // visible: false,
    key: 'main_title',
    img: 'sprite/MENU_CLIP.png',
    s_rect: [0, 41, 496, 80],
    center: [496 / 2, 0],
    size: [496, 80],
    pos: [796 / 2, 0]
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
  }])
  const [layouts, set_layouts] = useState<ICookedLayoutInfo[]>([])

  const draw_ui = useCallback(async () => {
    const canvas = canvas_ref.current;
    const onscreen_ctx = canvas?.getContext('2d');

    const offscreen = offscreen_ref.current;
    const offscreen_ctx = offscreen?.getContext('2d');
    if (!canvas || !offscreen || !offscreen_ctx || !onscreen_ctx || !lf2) return;

    const { width, height } = canvas.getBoundingClientRect();
    const screen_w = Math.floor(width);
    const screen_h = Math.floor(height);

    if (canvas.width !== screen_w || canvas.height !== screen_h) {
      canvas.width = screen_w;
      canvas.height = screen_h;
    }
    if (offscreen.width !== screen_w || offscreen.height !== screen_h) {
      offscreen.width = screen_w;
      offscreen.height = screen_h;
    } else {
      offscreen_ctx.fillStyle = 'rgb(16, 32, 108)';
      offscreen_ctx.fillRect(0, 0, screen_w, screen_h)
    }

    for (const layout of layouts) {
      let { _visible, _img } = layout;
      if (!_visible(layout)) continue;
      const [w, h] = layout._size;
      const [l, t] = layout._left_top
      offscreen_ctx.drawImage(_img.img_ele, ...layout._s_rect,
        screen_w * l / f_w,
        screen_h * t / f_h,
        screen_w * w / f_w,
        screen_h * h / f_h
      );
    }
    onscreen_ctx.drawImage(offscreen, 0, 0);
  }, [layouts, lf2])

  useEffect(() => {
    offscreen_ref.current = document.createElement('canvas');
  }, []);

  const cook_layouts = useCallback(async () => {
    if (!lf2) return;

    const get_val = (word: string) => (layout: ICookedLayoutInfo) => {
      if (word === 'mouse_on_me') {
        const [x, y] = layout._left_top;
        const [w, h] = layout._size;
        if (x > mem.current.mouse_x) return '0';
        if (y > mem.current.mouse_y) return '0';
        if (x + w < mem.current.mouse_x) return '0';
        if (y + h < mem.current.mouse_y) return '0';
        return '1'
      }
      return word
    }

    const layouts: ICookedLayoutInfo[] = [];
    for (const raw_layout of raw_layouts) {
      const { visible, img } = raw_layout;
      const img_path = Array.isArray(img) ? random_get(img) : img;
      const preload = async (img_path: string) => {
        const img_info = image_pool.find(img_path);
        if (img_info) return img_info;
        const img_url = await lf2.import(img_path)
        return await image_pool.load(img_path, img_url)
      }
      const _img = await preload(img_path);

      const [sx = 0, sy = 0, sw = 0, sh = 0] = raw_layout.s_rect ?? [0, 0, _img.w, _img.h]
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
        cooked._visible = cond.make()
      }
      layouts.push(cooked)
    }
    set_layouts(layouts);
  }, [raw_layouts, lf2])

  useEffect(() => {
    cook_layouts();
  }, [cook_layouts])

  useEffect(() => {
    if (!lf2) return;
    const render_once = () => {
      draw_ui();
      requestAnimationFrame(render_once)
    }
    requestAnimationFrame(render_once)
  }, [lf2, draw_ui]);

  const onPointerDown = (e: React.PointerEvent) => {
    if (e.isPrimary) mem.current.pointer_down = true;
  }
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
  }
  const onPointerUp = (e: React.PointerEvent) => {
    if (e.isPrimary) mem.current.pointer_down = false;
  }
  return (
    <canvas ref={canvas_ref} className='game_ui_canvas'
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerUp}
    />
  )
}



export const canvas_2_screen = (ctx: CanvasRenderingContext2D, { x, y }: { x: number, y: number }) => {
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

export const screen_2_canvas = (ctx: CanvasRenderingContext2D, { x, y }: { x: number, y: number }) => {
  const matrix = ctx.getTransform().invertSelf()
  if (!matrix.is2D) return { x: NaN, y: NaN }
  const { a, b, c, d, e, f } = matrix
  return {
    x: Math.round(x * a + y * c + e),
    y: Math.round(x * b + y * d + f)
  };
}
export default App;
