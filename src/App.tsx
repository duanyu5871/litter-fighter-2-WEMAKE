import JSZIP from 'jszip';
import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import './App.css';
import { dat_mgr } from './G/loader/DatLoader';
import Scene from './Scene';
import open_file, { read_file } from './Utils/open_file';
import './init';
import lf2_dat_str_to_json from './js_utils/lf2_dat_translator/dat_2_json';
import read_lf2_dat from './read_lf2_dat';
import { Defines } from './js_utils/lf2_type/defines';

function App() {
  const _canvas_ref = useRef<HTMLCanvasElement>(null)
  const _text_area_dat_ref = useRef<HTMLTextAreaElement>(null);
  const _text_area_json_ref = useRef<HTMLTextAreaElement>(null);
  const [scene, set_scene] = useState<ReturnType<typeof Scene>>()
  useEffect(() => {
    const canvas = _canvas_ref.current;
    if (!canvas) return;
    const scene = Scene(canvas, () => set_scene(scene));
    const w = Defines.OLD_SCREEN_WIDTH;
    const h = Defines.OLD_SCREEN_HEIGHT;
    const on_resize = () => {
      if (scene.camera instanceof THREE.PerspectiveCamera) {
        scene.camera.aspect = w / h
        scene.camera.updateProjectionMatrix()
      } else if (scene.camera instanceof THREE.OrthographicCamera) {
        scene.camera.left = 0
        scene.camera.right = w
        scene.camera.top = h
        scene.camera.bottom = 0
        scene.camera.updateProjectionMatrix()
      }
      scene.renderer.setSize(w, h);
    }
    on_resize();
    window.addEventListener('resize', on_resize)
    return () => {
      scene.release()
      window.removeEventListener('resize', on_resize)
    }
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
  return (
    <div className="App">
      <select onChange={e => scene?.play_character(e.target.value)}>
        {dat_mgr.characters.map(v => <option value={'' + v.id} key={v.id}>{v.base.name}</option>)}
      </select>
      <select onChange={e => scene?.change_bg(e.target.value)}>
        {dat_mgr.backgrounds.map(v => <option value={'' + v.id} key={v.id}>{v.base.name}</option>)}
      </select>
      <input type='checkbox' onChange={(e) => set_closed(!e.target.checked)} checked={!closed} />
      <canvas ref={_canvas_ref} className='renderer_canvas' />

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

export default App;
