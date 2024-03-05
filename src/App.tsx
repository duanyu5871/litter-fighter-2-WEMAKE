import JSZIP from 'jszip';
import './init';
import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import './App.css';
import Scene from './Scene';
import open_file, { read_file } from './Utils/open_file';
import lf2_dat_str_to_json from './js_utils/lf2_dat_translator/dat_2_json';
import read_lf2_dat from './read_lf2_dat';

function App() {
  const _canvas_ref = useRef<HTMLCanvasElement>(null)
  const _text_area_dat_ref = useRef<HTMLTextAreaElement>(null);
  const _text_area_json_ref = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    const canvas = _canvas_ref.current;
    if (!canvas) return;
    const scene = Scene(canvas);
    const on_resize = () => {
      if (scene.camera instanceof THREE.PerspectiveCamera) {
        scene.camera.aspect = 794 / 550
        scene.camera.updateProjectionMatrix()
      } else if (scene.camera instanceof THREE.OrthographicCamera) {
        scene.camera.left = 0
        scene.camera.right = 794
        scene.camera.top = 550
        scene.camera.bottom = 0
        scene.camera.updateProjectionMatrix()
      }
      scene.renderer.setSize(
        794,
        550
      );
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
      <canvas ref={_canvas_ref} className='renderer_canvas' />
      {closed ? null :
        <div style={{
          position: 'fixed',
          zIndex: 1,
          width: '100vw',
          height: '100vh',
          display: 'flex',
          flexDirection: 'column'
        }}>
          <div>
            <button onClick={() => set_closed(true)}>close</button>
            <button onClick={on_click_add_pack} disabled={loading}>add_pack</button>
            <button onClick={on_click_read_dat} disabled={loading}>read_dat</button>
            <button onClick={on_click_add_pack_2} disabled={loading}>add_c</button>
          </div>
          <div style={{ display: 'flex', flex: 1, alignSelf: 'stretch' }}>
            <textarea style={{ flex: 1, alignSelf: 'stretch' }} ref={_text_area_dat_ref} />
            <textarea style={{ flex: 1, alignSelf: 'stretch' }} ref={_text_area_json_ref} />
          </div>
        </div>
      }
    </div>
  );
}

export default App;
