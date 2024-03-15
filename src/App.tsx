import JSZIP from 'jszip';
import { useCallback, useEffect, useRef, useState } from 'react';
import './App.css';
import { BlackgroundRow } from './BlackgroundRow';
import LF2 from './LF2/LF2';
import Stage from './LF2/Stage';
import { Character } from './LF2/entity/Character';
import { Log } from './Log';
import { PlayerRow } from './PlayerRow';
import open_file, { read_file } from './Utils/open_file';
import './init';
import lf2_dat_str_to_json from './js_utils/lf2_dat_translator/dat_2_json';
import read_lf2_dat from './read_lf2_dat';
import { is_num } from './js_utils/is_num';
import Fullsreen from './Fullsreen';

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
      lf2.on_stage_change = s => set_cur_stage(s)
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
      .catch(e => alert('' + e))
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
      .catch(e => alert('' + e))
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
      .catch(e => alert('' + e))
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
      </div>
      <div className='editor_view' style={{ display: editor_closed ? 'none' : void 0 }}>
        <div className='top'>
          <button onClick={() => set_editor_closed(true)} disabled={loading}>close</button>
          <button onClick={on_click_read_dat} disabled={loading}>read_dat</button>
        </div>
        <div className='main'>
          <textarea ref={_text_area_dat_ref} />
          <textarea ref={_text_area_json_ref} />
        </div>
      </div>
    </div >
  );
}

export default App;
