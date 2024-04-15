import JSZIP from 'jszip';
import { useCallback, useEffect, useRef, useState } from 'react';
import './App.css';
import { BlackgroundRow } from './BlackgroundRow';
import Fullsreen from './Fullsreen';
import LF2, { ILf2Callback } from './LF2/LF2';
import Select from './LF2/ui/Component/Select';
import { Button } from './LF2/ui/Component/Button';
import { Input } from './LF2/ui/Component/Input';
import { TextArea } from './LF2/ui/Component/TextArea';
import { ILayoutInfo } from './Layout/ILayoutInfo';
import { Log } from './Log';
import { PlayerRow } from './PlayerRow';
import open_file, { read_file } from './Utils/open_file';
import './game_ui.css';
import './init';
import { arithmetic_progression } from './js_utils/arithmetic_progression';
import lf2_dat_str_to_json from './js_utils/lf2_dat_translator/dat_2_json';
import read_lf2_dat from './read_lf2_dat';
import { useLocalBoolean, useLocalNumber, useLocalString } from './useLocalStorage';

const fullsreen = new Fullsreen();

function App() {
  const _overlay_ref = useRef<HTMLDivElement>(null)
  const _canvas_ref = useRef<HTMLCanvasElement>(null)
  const _game_contiainer_ref = useRef<HTMLDivElement>(null)

  const _text_area_dat_ref = useRef<HTMLTextAreaElement>(null);
  const _text_area_json_ref = useRef<HTMLTextAreaElement>(null);
  const lf2_ref = useRef<LF2 | undefined>();

  const [editor_closed, set_editor_closed] = useState(true);
  const [game_overlay, set_game_overlay] = useLocalBoolean('game_overlay', true);
  const [control_panel, set_control_panel] = useLocalBoolean('control_panel', true);
  const [loading, set_loading] = useState(false);
  const [loaded, set_loaded] = useState(false);
  const [paused, set_paused] = useState(false);

  useEffect(() => {
    const lf2 = lf2_ref.current;
    if (!lf2) return;
    lf2.world.paused = paused;
  }, [paused])

  const update_once = useCallback(() => {
    const lf2 = lf2_ref.current;
    set_paused(true);
    lf2?.world.update_once()
  }, [])

  const [show_indicators, set_show_indicators] = useState(false);
  useEffect(() => {
    const lf2 = lf2_ref.current;
    if (!lf2) return;
    lf2.world.show_indicators = show_indicators;
  }, [show_indicators])

  const [fast_forward, set_fast_forward] = useState(false);
  useEffect(() => {
    const lf2 = lf2_ref.current;
    if (!lf2) return;
    lf2.world.playrate = fast_forward ? 100 : 1;
  }, [fast_forward])
  const toggle_fullscreen = () => {
    if (fullsreen.is_fullscreen())
      fullsreen.exit();
    else
      fullsreen.enter(document.body.parentElement!);
  }
  useEffect(() => {
    const on_key_down = (e: KeyboardEvent) => {
      const lf2 = lf2_ref.current;
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
  }, [loaded, set_control_panel, set_game_overlay, update_once])

  const [layout, set_layout] = useState<string | undefined>(void 0);
  useEffect(() => {
    lf2_ref.current?.set_layout(layout)
  }, [layout])

  const [layouts, set_layouts] = useState<Readonly<ILayoutInfo>[]>([{ id: '', name: '无页面' }]);

  useEffect(() => {
    const canvas = _canvas_ref.current!;
    const overlay = _overlay_ref.current!;

    if (!lf2_ref.current) {
      const lf2 = (window as any).lf2 = lf2_ref.current = new LF2(canvas, overlay);
      lf2.layouts().then((layouts) => {
        const layout_data_list = layouts?.map(l => l.data) || []
        layout_data_list.unshift({ id: '', name: '无页面' })
        set_layouts(layout_data_list);
        if (layout_data_list.length > 1)
          set_layout(layout_data_list[1].id)
      })
    }
    const callback: ILf2Callback = {
      on_layout_changed: v => { set_layout(v?.data.id) },
      on_loading_start: () => {
        set_loading(true);
      },
      on_loading_end: () => {
        set_loaded(true);
        set_loading(false);
      }
    }
    lf2_ref.current.add_callbacks(callback);
    return () => { lf2_ref.current?.del_callbacks(callback) }
  }, []);

  const on_click_load_local_zip = () => {
    const lf2 = lf2_ref.current;
    if (!lf2) return;
    open_file({ accept: '.zip' })
      .then(v => v[0])
      .then(v => JSZIP.loadAsync(v))
      .then(v => lf2.load(v))
      .catch(e => Log.print('on_click_load_local_zip', e))
  }
  const on_click_download_zip = () => {
    const a = document.createElement('a');
    a.href = 'lf2.data.zip';
    a.download = 'lf2.data.zip';
    a.click();
  }

  const on_click_load_builtin = async () => {
    const lf2 = lf2_ref.current;
    if (!lf2) return;
    lf2.set_layout('loading')
  }
  const open_dat = async () => {
    const [file] = await open_file({ accept: '.dat' });
    const buf = await read_file(file, { as: 'ArrayBuffer' });
    return read_lf2_dat(buf)
  }
  const on_click_read_dat = () => {
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
    })
  }


  const [render_size_mode, set_render_size_mode] = useLocalString<'fixed' | 'fill' | 'cover' | 'contain'>('render_size_mode', 'fixed');
  const [render_fixed_scale, set_render_fixed_scale] = useLocalNumber<number>('render_fixed_scale', 1);
  const [custom_render_fixed_scale, set_custom_render_fixed_scale] = useLocalNumber<number>('custom_render_fixed_scale', 1);
  const [v_align, set_v_align] = useLocalNumber<number>('v_align', 0.5);
  const [h_align, set_h_align] = useLocalNumber<number>('h_align', 0.5);
  const [custom_h_align, set_custom_h_align] = useLocalNumber<number>('custom_h_align', 0.5);
  const [custom_v_align, set_custom_v_align] = useLocalNumber<number>('custom_v_align', 0.5);

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
        <canvas ref={_canvas_ref} tabIndex={-1} className='game_canvas' width={794} height={450} />
        <div className='game_overlay' ref={_overlay_ref} style={{ display: !game_overlay ? 'none' : void 0 }} />
      </div>
      <div className='debug_ui'>
        <div className='debug_ui_row'>
          {'页面: '}
          <Select
            value={layout}
            on_changed={set_layout}
            items={layouts}
            option={o => [o.id, o.name]} />
          {'Mode: '}
          <Select
            value={render_size_mode}
            on_changed={set_render_size_mode}
            items={['fixed', 'fill', 'cover', 'contain'] as const} />
          {
            render_size_mode !== 'fixed' ? null : <div className='render_scale'>
              {'缩放: '}
              <Select
                className='render_scale_select'
                value={render_fixed_scale}
                on_changed={set_render_fixed_scale}
                items={arithmetic_progression(0, 4, 0.5)}
                option={i => [i, '✕' + (i || '?')]} />
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
                {'对齐: '}
                <Select
                  value={v_align}
                  on_changed={set_v_align}
                  items={[-2, 0, 0.5, 1]}
                  option={(v, idx) => [v, v <= -1 ? '?' : ['上', '中', '下'][idx - 1]]} />
                {
                  v_align > -1 ? null : <Input min={-1} max={2} type='number' step={0.1}
                    value={custom_v_align}
                    onChange={e => set_custom_v_align(Number(e.target.value))} />
                }
                <Select
                  value={h_align}
                  on_changed={set_h_align}
                  items={[-2, 0, 0.5, 1]}
                  option={(v, idx) => [v, v <= -1 ? '?' : ['左', '中', '右'][idx - 1]]} />
                {
                  h_align > -1 ? null : <Input min={-1} max={2} type='number' step={0.1}
                    value={custom_h_align}
                    onChange={e => set_custom_h_align(Number(e.target.value))} />
                }
              </div>
          }
          <Button onClick={on_click_download_zip}>下载数据包</Button>
          <Button onClick={on_click_load_local_zip} disabled={loading}>加载数据包</Button>
          <Button onClick={on_click_load_builtin} disabled={loading}>加载内置数据</Button>
          <Button onClick={() => set_editor_closed(false)}>dat viewer</Button>
        </div>
        <div className='debug_ui_row'>
          <Button onClick={() => set_paused(v => !v)}>{paused ? '恢复' : '暂停'}(F1)</Button>
          <Button onClick={() => update_once()}>更新一次(F2)</Button>
          <Button onClick={() => set_fast_forward(v => !v)}>{fast_forward ? '正常' : '不限'}速度(F5)</Button>
          <Button onClick={() => set_show_indicators(v => !v)}>{show_indicators ? '隐藏' : '显示'}指示器(F6)</Button>
          <Button onClick={() => set_game_overlay(v => !v)}>{game_overlay ? '隐藏' : '显示'}游戏覆盖(F7)</Button>
          <Button onClick={() => set_control_panel(v => !v)}>{control_panel ? '隐藏' : '显示'}控制面板(F8)</Button>
          <Button onClick={() => toggle_fullscreen()}>全屏(F9)</Button>
        </div>
        {
          loaded ? <>
            {Array.from(lf2_ref.current?.player_infos.values() ?? []).map((info, idx) => <PlayerRow key={idx} lf2={lf2_ref.current} which={idx + 1} visible={control_panel} />)}
            <BlackgroundRow lf2={lf2_ref.current} visible={control_panel} />
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
