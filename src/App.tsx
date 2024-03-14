import JSZIP from 'jszip';
import { useEffect, useRef, useState } from 'react';
import './App.css';
import Stage from './G/Stage';
import { TKeyName } from './G/controller/IController';
import { PlayerController } from './G/controller/PlayerController';
import { Character } from './G/entity/Character';
import LF2 from './LF2';
import { Log, Warn } from './Log';
import open_file, { read_file } from './Utils/open_file';
import random_get from './Utils/random_get';
import './init';
import lf2_dat_str_to_json from './js_utils/lf2_dat_translator/dat_2_json';
import read_lf2_dat from './read_lf2_dat';

function App() {
  const _overlay_ref = useRef<HTMLDivElement>(null)
  const _canvas_ref = useRef<HTMLCanvasElement>(null)
  const _text_area_dat_ref = useRef<HTMLTextAreaElement>(null);
  const _text_area_json_ref = useRef<HTMLTextAreaElement>(null);
  const [lf2, set_lf2] = useState<LF2>();
  const [cur_stage, set_cur_stage] = useState<Stage>();
  const [cur_character, set_cur_character] = useState<Character>();
  const [bg, set_bg] = useState<string>();

  useEffect(() => {
    const canvas = _canvas_ref.current;
    const overlay = _overlay_ref.current;
    if (!canvas) return;
    const lf2 = new LF2(canvas, overlay);
    Object.defineProperty(window, 'lf2', { value: lf2, configurable: true })
    lf2.start().then(() => {
      set_lf2(lf2);
      set_bg(lf2.dat_mgr.backgrounds[0].id)
      lf2.change_bg(lf2.dat_mgr.backgrounds[0].id)
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
  const [closed, set_closed] = useState(false);
  const kc = (cur_character?.controller instanceof PlayerController) ?
    cur_character.controller.kc :
    void 0;

  return (
    <div className="App">
      {[1, 2, 3, 4].map(v => <PlayerRow key={v} which={v} lf2={lf2} />)}
      <div style={{ display: 'flex', gap: 5 }}>
        background:
        <select onChange={e => { set_bg(e.target.value); bg && lf2?.change_bg(e.target.value) }} value={bg}>
          {lf2?.dat_mgr.backgrounds.map(v => <option value={v.id} key={v.id}>{v.base.name}</option>)}
        </select>
      </div>
      <input type='checkbox' onChange={(e) => set_closed(!e.target.checked)} checked={!closed} />
      <div className='game_contiainer'>
        <canvas ref={_canvas_ref} className='game_canvas' width={795} height={450} />
        <div className='game_overlay' ref={_overlay_ref} />
      </div>
      <div style={{
        position: 'fixed',
        zIndex: 1,
        width: '100vw',
        height: '100vh',
        display: closed ? 'none' : 'flex',
        flexDirection: 'column'
      }}>
        <div>
          <button onClick={on_click_add_pack} disabled={loading}>add_pack</button>
          <button onClick={on_click_read_dat} disabled={loading}>read_dat</button>
          <button onClick={on_click_add_pack_2} disabled={loading}>add_c</button>
        </div>
        <div style={{ display: 'flex', flex: 1, alignSelf: 'stretch' }}>
          <textarea style={{ flex: 1, alignSelf: 'stretch' }} ref={_text_area_dat_ref} />
          <textarea style={{ flex: 1, alignSelf: 'stretch' }} ref={_text_area_json_ref} />
        </div>
      </div>
    </div>
  );
}
const key_codes_map: { [x in string]?: Record<TKeyName, string> } = {
  '1': {
    L: 'a',
    R: 'd',
    U: 'w',
    D: 's',
    a: 'j',
    j: 'k',
    d: 'l',
  },
  '2': {
    L: 'arrowleft',
    R: 'arrowright',
    U: 'arrowup',
    D: 'arrowdown',
    a: 'end',
    j: 'pageup',
    d: 'pagedown',
  }
}

function PlayerRow(props: { which: number, lf2?: LF2 | undefined }) {
  const { lf2 } = props;
  const which = '' + props.which
  const [team, set_team] = useState<string>('')
  const [c_id, set_character_id] = useState<string>();
  const [player_name, set_player_name] = useState<string>(which)

  useEffect(() => {
    if (!lf2) return;
    const lp = lf2.get_local_player(which)
    if (!lp) return;
    lp.name = player_name.trim() || '' + which;
    lp.team = Number(team);
  }, [which, player_name, team, lf2])

  if (!lf2) return null;
  const on_click_remove = () => lf2.remove_player(which)
  const on_click_add = () => {
    const r_c_id = c_id || random_get(lf2.dat_mgr.characters)?.id;
    if (!r_c_id) return;

    const character = lf2.add_player(which, r_c_id)
    if (!character) return;
    const ctrl = character.controller as PlayerController;
    const kc = key_codes_map[which];
    if (kc) ctrl.set_key_codes(kc)
    character.name = player_name || which;
  }
  const on_name_edit: React.ChangeEventHandler<HTMLInputElement> = e => {
    set_player_name(e.target.value)
  }
  const on_name_blur: React.FocusEventHandler<HTMLInputElement> = e => {
    set_player_name(e.target.value.trim() || which);
  }
  return (
    <div key={which} style={{ display: 'flex', gap: 5 }}>
      <div>player {which}:</div>
      <input
        type='text'
        maxLength={7}
        style={{ width: 100 }}
        placeholder='enter player name'
        value={player_name}
        onChange={on_name_edit}
        onBlur={on_name_blur}
      />
      <select
        value={c_id}
        onChange={e => set_character_id(e.target.value)}>
        <option value=''>Random</option>
        {lf2.dat_mgr.characters.map(v => <option key={v.id} value={v.id}>{v.base.name}</option>)}
      </select>
      <select value={team} onChange={e => set_team(e.target.value)}>
        <option value='0'>independent</option>
        <option value='1'>team 1</option>
        <option value='2'>team 2</option>
        <option value='3'>team 3</option>
        <option value='4'>team 4</option>
      </select>
      <button onClick={on_click_add}>add</button>
      <button onClick={on_click_remove}>remove</button>
    </div>
  )
}
export default App;

