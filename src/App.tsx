import JSZIP from 'jszip';
import { useCallback, useEffect, useRef, useState } from 'react';
import './App.css';
import { BlackgroundRow } from './BlackgroundRow';
import Fullsreen from './Fullsreen';
import { GameUI } from './GameUI';
import LF2 from './LF2/LF2';
import Select from './LF2/ui/Select';
import { Button } from './LF2/ui/Select/Button';
import { Input } from './LF2/ui/Select/Input';
import { TextArea } from './LF2/ui/Select/TextArea';
import { Log } from './Log';
import { PlayerRow } from './PlayerRow';
import open_file, { read_file } from './Utils/open_file';
import './game_ui.css';
import './init';
import { arithmetic_progression } from './js_utils/arithmetic_progression';
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
      fullsreen.enter(document.body);
  }


  useEffect(() => {
    const on_key_down = (e: KeyboardEvent) => {
      const interrupt = () => {
        e.stopPropagation();
        e.preventDefault();
        e.stopImmediatePropagation();
      }
      switch (e.key?.toUpperCase()) {
        case 'F9':
          interrupt();
          toggle_fullscreen();
          break;
      }
      if (!lf2 || !loaded) return;
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
      // lf2.world.callbacks.add({ on_stage_change: (_, s) => set_cur_stage(s) })
      // lf2.on_click_character = c => set_cur_character(c)
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

  const [render_size_mode, set_render_size_mode] = useState<'fixed' | 'fill' | 'cover' | 'contain'>('fixed');
  const [render_fixed_scale, set_render_fixed_scale] = useState<number>(0);
  const [custom_render_fixed_scale, set_custom_render_fixed_scale] = useState<number>(0.25);
  const [v_align, set_v_align] = useState<number>(0.5);
  const [h_align, set_h_align] = useState<number>(0.5);
  const [custom_h_align, set_custom_h_align] = useState<number>(0.5);
  const [custom_v_align, set_custom_v_align] = useState<number>(0.5);

  useEffect(() => {
    const ele = _game_contiainer_ref.current;
    if (!ele) return;
    const scale: number = render_fixed_scale || custom_render_fixed_scale;
    const on_resize = () => {
      const screen_w = 794;
      const screen_h = 450;
      const win_w = Math.floor(window.innerWidth);
      const win_h = Math.floor(window.innerHeight);
      let view_w = win_w;
      let view_h = win_h;
      const s_1 = screen_w / screen_h
      const s_2 = win_w / win_h
      switch (render_size_mode) {
        case 'fill':
          ele.style.width = win_w + 'px';
          ele.style.height = win_h + 'px';
          break;
        case 'cover':
          if (s_1 > s_2) {
            ele.style.height = win_h + 'px';
            ele.style.width = (view_w = win_h * s_1) + 'px';
          } else {
            ele.style.width = win_w + 'px';
            ele.style.height = (view_h = win_w / s_1) + 'px';
          }
          break
        case 'contain':
          if (s_1 > s_2) {
            ele.style.width = win_w + 'px';
            ele.style.height = (view_h = win_w / s_1) + 'px';
          } else {
            ele.style.height = win_h + 'px';
            ele.style.width = (view_w = win_h * s_1) + 'px';
          }
          break
        case 'fixed':
        default:
          ele.style.width = (view_w = scale * screen_w) + 'px';
          ele.style.height = (view_h = scale * screen_h) + 'px';
          break;
      }
      const h_align_ = h_align < -1 ? custom_h_align : h_align;
      const v_align_ = v_align < -1 ? custom_v_align : v_align;
      ele.style.left = Math.floor((win_w - view_w) * h_align_) + 'px';
      ele.style.top = Math.floor((win_h - view_h) * v_align_) + 'px';
    }
    window.addEventListener('resize', on_resize);
    on_resize();
    return () => window.removeEventListener('resize', on_resize);
  }, [
    render_size_mode, render_fixed_scale, custom_render_fixed_scale,
    v_align, h_align, custom_h_align, custom_v_align
  ])

  return (
    <div className="App">
      <div className='game_contiainer' ref={_game_contiainer_ref}>
        <canvas ref={_canvas_ref} tabIndex={-1} className='game_canvas' width={795} height={450} />
        <div className='game_overlay' ref={_overlay_ref} style={{ display: !game_overlay ? 'none' : void 0 }} />
        <div className='game_ui'>
          <GameUI lf2={lf2} />
        </div>
      </div>
      <div className='debug_ui'>
        <div className='debug_ui_row'>
          {'Mode: '}
          <Select
            value={render_size_mode}
            on_changed={set_render_size_mode}
            items={['fixed', 'fill', 'cover', 'contain'] as const} />
          {
            render_size_mode !== 'fixed' ? null : <div className='render_scale'>
              {'Scale: '}
              <Select
                className='render_scale_select'
                value={render_fixed_scale}
                on_changed={set_render_fixed_scale}
                items={arithmetic_progression(0, 4, 1)}
                option={i => [i, 'Scale: x' + (i || '?')]} />
              {
                render_fixed_scale ? null :
                  <Input
                    className='render_scale_input'
                    type='number'
                    min={0}
                    step={custom_render_fixed_scale <= 0.5 ? 0.1 : 0.5}
                    value={custom_render_fixed_scale}
                    onChange={e => set_custom_render_fixed_scale(Number(e.target.value))} />
              }
            </div>
          }
          {
            render_size_mode === 'fill' ? null :
              <div className='render_align'>
                {'Align: '}
                <Select
                  value={v_align}
                  on_changed={set_v_align}
                  items={[-2, 0, 0.5, 1]}
                  option={(v, idx) => [v, v <= -1 ? 'V' : ['Start', 'Center', 'End'][idx - 1]]} />
                {
                  v_align > -1 ? null : <Input min={-1} max={2} type='number' step={0.1}
                    value={custom_v_align}
                    onChange={e => set_custom_v_align(Number(e.target.value))} />
                }
                <Select
                  value={h_align}
                  on_changed={set_h_align}
                  items={[-2, 0, 0.5, 1]}
                  option={(v, idx) => [v, v <= -1 ? 'H' : ['Start', 'Center', 'End'][idx - 1]]} />
                {
                  h_align > -1 ? null : <Input min={-1} max={2} type='number' step={0.1}
                    value={custom_h_align}
                    onChange={e => set_custom_h_align(Number(e.target.value))} />
                }
              </div>
          }
          <Button onClick={on_click_load_local_zip} disabled={loading || loaded}>加载本地ZIP</Button>
          <Button onClick={on_click_load_builtin_zip} disabled={loading || loaded}>加载默认ZIP</Button>
          <Button onClick={on_click_load_builtin} disabled={loading || loaded}>加载默认数据</Button>
          <Button onClick={on_click_cleaup} disabled={loading || !loaded}>清空数据</Button>
          <Button onClick={() => toggle_fullscreen()}>Fullscreen(F9)</Button>
          <Button onClick={() => set_editor_closed(false)}>dat viewer</Button>
        </div>
        {
          loaded ? <>
            <div className='debug_ui_row'>
              <Button onClick={() => set_paused(v => !v)}>{paused ? 'resume' : 'pause'}(F1)</Button>
              <Button onClick={() => update_once()}>update_once(F2)</Button>
              <Button onClick={() => set_fast_forward(v => !v)}>{fast_forward ? 'normal' : 'unlimited'} speed(F5)</Button>
              <Button onClick={() => set_show_indicators(v => !v)}>{show_indicators ? 'hide' : 'show'} indicators(F6)</Button>
              <Button onClick={() => set_game_overlay(v => !v)}>{game_overlay ? 'hide' : 'show '} game overlay(F7)</Button>
              <Button onClick={() => set_control_panel(v => !v)}>{control_panel ? 'hide' : 'show '} control panel(F8)</Button>
            </div>
            {[1, 2, 3, 4].map(v => <PlayerRow key={v} which={v} lf2={lf2} visible={control_panel} />)}
            <BlackgroundRow lf2={lf2} visible={control_panel} />
          </> : null
        }
      </div>
      <div className='editor_view' style={{ display: editor_closed ? 'none' : void 0 }}>
        <div className='top'>
          <Button onClick={() => set_editor_closed(true)} disabled={loading}>close</Button>
          <Button onClick={on_click_read_dat} disabled={loading}>read_dat</Button>
        </div>
        <div className='main'>
          <TextArea ref={_text_area_dat_ref} wrap="off" />
          <TextArea ref={_text_area_json_ref} wrap="off" />
        </div>
      </div>
    </div >
  );
}

export default App;
