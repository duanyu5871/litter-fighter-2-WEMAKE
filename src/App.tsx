import JSZIP from 'jszip';
import { useEffect, useRef, useState } from 'react';
import './App.css';
import { BlackgroundRow } from './BlackgroundRow';
import LF2 from './G/LF2';
import Stage from './G/Stage';
import { Character } from './G/entity/Character';
import { Log, Warn } from './Log';
import { PlayerRow } from './PlayerRow';
import open_file, { read_file } from './Utils/open_file';
import './init';
import lf2_dat_str_to_json from './js_utils/lf2_dat_translator/dat_2_json';
import read_lf2_dat from './read_lf2_dat';

function App() {
  const _overlay_ref = useRef<HTMLDivElement>(null)
  const _canvas_ref = useRef<HTMLCanvasElement>(null)
  const _text_area_dat_ref = useRef<HTMLTextAreaElement>(null);
  const _text_area_json_ref = useRef<HTMLTextAreaElement>(null);
  const [lf2, set_lf2] = useState<LF2>();
  const [editor_closed, set_editor_closed] = useState(false);
  const [game_overlay_closed, set_game_overlay_closed] = useState(true);
  const [paused, set_paused] = useState(false);

  const [cur_stage, set_cur_stage] = useState<Stage>();
  const [cur_character, set_cur_character] = useState<Character>();

  useEffect(() => {
    if (!lf2) return;
    lf2.world.paused = paused;
  }, [lf2, paused])

  useEffect(() => {
    const canvas = _canvas_ref.current;
    const overlay = _overlay_ref.current;
    if (!canvas) return;
    const lf2 = new LF2(canvas, overlay);
    Object.defineProperty(window, 'lf2', { value: lf2, configurable: true })
    lf2.start().then(() => {
      set_lf2(lf2);
    }).catch((e) => console.warn(e))
    lf2.on_stage_change = s => set_cur_stage(s)
    lf2.on_click_character = c => set_cur_character(c)
    return () => { lf2.dispose() }
  }, [])
  const [loading, set_loading] = useState(false);
  const on_click_add_pack = () => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = '.zip'
    input.click()
    input.onchange = async () => {
      const file = input.files?.[0]
      if (!file) return;
      set_loading(true);
      JSZIP.loadAsync(file).then(zip => {
        Log.print('App', zip)
      }).catch(e => {
        Warn.print('App', e)
      }).finally(() => {
        set_loading(false)
      })
    }
  }
  const on_click_add_pack_2 = () => {
    set_loading(true);
    open_dat().then((str) => {
      return lf2_dat_str_to_json(str);
    }).then((str) => {
      Log.print('App', str)
    }).catch(e => {
      console.error(e)
    }).finally(() => {
      set_loading(false)
    })
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
        <button onClick={() => set_editor_closed(false)}>dat viewer</button>
        <button onClick={() => set_game_overlay_closed(v => !v)}>{game_overlay_closed ? 'show' : 'hide '} game overlay</button>
        <button onClick={() => set_paused(v => !v)}>{paused ? 'resume' : 'pause'}</button>
      </div>
      {[1, 2, 3, 4].map(v => <PlayerRow key={v} which={v} lf2={lf2} />)}
      <BlackgroundRow lf2={lf2} />
      <div className='game_contiainer'>
        <canvas tabIndex={-1} ref={_canvas_ref} className='game_canvas' width={795} height={450}
          onPointerDown={e => {
            e.stopPropagation();
            e.preventDefault();
          }}
        />
        <div className='game_overlay' ref={_overlay_ref} style={{ display: !game_overlay_closed ? 'none' : void 0 }} />
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

