import JSZIP from 'jszip';
import { useCallback, useEffect, useRef, useState } from 'react';
import './App.css';
import { BackgroundRow } from './BackgroundRow';
import { Button } from './Component/Button';
import { Input } from './Component/Input';
import Select from './Component/Select';
import { ToggleButton } from "./Component/ToggleButton";
import EditorView from './EditorView';
import LF2 from './LF2/LF2';
import { ILf2Callback } from './LF2/ILf2Callback';
import { BaseController } from './LF2/controller/BaseController';
import { ILayoutInfo } from './Layout/ILayoutInfo';
import { Log } from './Log';
import { PlayerRow } from './PlayerRow';
import open_file from './Utils/open_file';
import { arithmetic_progression } from './common/arithmetic_progression';
import './game_ui.css';
import './init';
import { useLocalBoolean, useLocalNumber, useLocalString } from './useLocalStorage';
import FullScreen from './LF2/dom/FullScreen';
const fullscreen = new FullScreen()
function App() {
  const _overlay_ref = useRef<HTMLDivElement>(null)
  const _canvas_ref = useRef<HTMLCanvasElement>(null)
  const _game_contiainer_ref = useRef<HTMLDivElement>(null)

  const lf2_ref = useRef<LF2 | undefined>();

  const [editor_open, set_editor_open] = useState(false);
  const [game_overlay, set_game_overlay] = useLocalBoolean('game_overlay', true);
  const [debug_panel, set_debug_panel] = useLocalBoolean('debug_panel', true);
  const [control_panel_visible, set_control_panel_visible] = useLocalBoolean('control_panel', true);
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
    if (fullscreen.is_fullscreen)
      fullscreen.exit();
    else
      fullscreen.enter(document.body.parentElement!);
  }
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
      on_layout_changed: v => { set_layout(v?.data.id ?? '') },
      on_loading_start: () => {
        set_loading(true);
      },
      on_loading_end: () => {
        set_loaded(true);
        set_loading(false);
      }
    }
    lf2_ref.current.callbacks.add(callback);
    return () => { lf2_ref.current?.callbacks.del(callback) }
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
    lf2.load('lf2.data.zip')
      .catch(e => Log.print('on_click_load_builtin, lf2.data.zip not exists, will try lf2_data', e))
      .then(() => lf2.load())
      .catch(e => Log.print('on_click_load_builtin', e))
  }

  const [render_size_mode, set_render_size_mode] = useLocalString<'fixed' | 'fill' | 'cover' | 'contain'>('render_size_mode', 'fixed');
  const [render_fixed_scale, set_render_fixed_scale] = useLocalNumber<number>('render_fixed_scale', 1);
  const [custom_render_fixed_scale, set_custom_render_fixed_scale] = useLocalNumber<number>('custom_render_fixed_scale', 1);
  const [v_align, set_v_align] = useLocalNumber<number>('v_align', 0.5);
  const [h_align, set_h_align] = useLocalNumber<number>('h_align', 0.5);
  const [custom_h_align, set_custom_h_align] = useLocalNumber<number>('custom_h_align', 0.5);
  const [custom_v_align, set_custom_v_align] = useLocalNumber<number>('custom_v_align', 0.5);
  const [debug_ui_pos, set_debug_ui_pos] = useLocalString<'left' | 'right' | 'top' | 'bottom'>('debug_ui_pos', 'top');
  const [touch_pad_on, set_touch_pad_on] = useLocalString<string>('touch_pad_on', '');

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
        <div className='game_overlay_ui' >
          <ToggleButton
            onToggle={set_control_panel_visible}
            checked={control_panel_visible}
            shortcut='F10'>
            <>显示控制面板</>
            <>隐藏控制面板</>
          </ToggleButton>
        </div>
      </div>
      <div className={'debug_ui debug_ui_' + debug_ui_pos} style={{ display: control_panel_visible ? 'none' : void 0 }}>
        <div className='debug_ui_row'>
          <Button onClick={on_click_download_zip}>下载数据包</Button>
          <Button onClick={on_click_load_local_zip} disabled={loading}>加载数据包</Button>
          <Button onClick={on_click_load_builtin} disabled={loading}>加载内置数据</Button>
          <Button onClick={() => set_editor_open(true)}>查看dat文件</Button>
          <ToggleButton
            onToggle={set_control_panel_visible}
            checked={control_panel_visible}
            shortcut='F10'>
            <>显示控制面板</>
            <>隐藏控制面板</>
          </ToggleButton>
          <Select
            items={['top', 'bottom', 'left', 'right'] as const}
            option={v => [v, v]}
            value={debug_ui_pos}
            on_changed={set_debug_ui_pos} />
        </div>
        <div className='debug_ui_row'>
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
        </div>
        <div className='debug_ui_row'>
          <ToggleButton
            onToggle={set_paused}
            checked={paused}
            shortcut='F1'>
            <>游戏暂停</>
            <>游戏恢复</>
          </ToggleButton>
          <Button
            onClick={update_once}
            shortcut='F2'>
            更新一帧
          </Button>
          <ToggleButton
            onToggle={set_fast_forward}
            checked={fast_forward}
            shortcut='shift+F5'>
            <>不限速度</>
            <>正常速度</>
          </ToggleButton>
          <ToggleButton
            onToggle={set_show_indicators}
            checked={show_indicators}
            shortcut='F6'>
            <>隐藏指示器</>
            <>显示指示器</>
          </ToggleButton>
          <ToggleButton
            onToggle={set_game_overlay}
            checked={game_overlay}
            shortcut='F7'>
            <>显示游戏覆盖</>
            <>隐藏游戏覆盖</>
          </ToggleButton>
          <ToggleButton
            onToggle={set_debug_panel}
            checked={debug_panel}
            disabled={!loaded}
            shortcut='F8'>
            <>显示调试面板</>
            <>隐藏调试面板</>
          </ToggleButton>
          <Button
            onClick={toggle_fullscreen}
            shortcut='F9'>
            全屏
          </Button>
        </div>

        {Array.from(lf2_ref.current?.player_infos.values() ?? []).map((info, idx) =>
          <PlayerRow
            key={idx}
            lf2={lf2_ref.current!}
            info={info}
            visible={debug_panel}
            touch_pad_on={touch_pad_on === info.id}
            on_click_toggle_touch_pad={() => set_touch_pad_on(touch_pad_on === info.id ? '' : info.id)} />
        )}
        <BackgroundRow lf2={lf2_ref.current} visible={debug_panel} />
      </div>
      <EditorView open={editor_open} onClose={() => set_editor_open(false)} />

      <GamePad player_id={touch_pad_on} lf2={lf2_ref.current} />
    </div >
  );
}

interface IAAAProps {
  lf2?: LF2;
  player_id?: string;
}
function GamePad(props: IAAAProps) {
  const { player_id, lf2 } = props;
  const [controller, set_controller] = useState<BaseController | undefined>(void 0);

  useEffect(() => {
    if (!lf2 || !player_id) return;
    return lf2.world.callbacks.add({
      on_player_character_add(add_player_id) {
        if (add_player_id !== player_id) return
        set_controller(lf2.player_characters.get(player_id)?.controller)
      },
      on_player_character_del(del_player_id) {
        if (del_player_id !== player_id) return
        set_controller(void 0);
      },
    })
  }, [lf2, player_id])

  if (!controller) return <></>
  return <>
    <img
      onTouchStart={() => controller?.start('a')}
      onTouchEnd={() => controller?.end('a')}
      src={require('./lf2_built_in_data/sprite/touch_btn_a.png')}
      alt='attack'
      draggable={false}
      style={{ width: 64, height: 64 }} />
    <img
      onTouchStart={() => controller?.start('j')}
      onTouchEnd={() => controller?.end('j')}
      src={require('./lf2_built_in_data/sprite/touch_btn_j.png')}
      alt='jump'
      draggable={false}
      style={{ width: 64, height: 64 }} />
    <img
      onTouchStart={() => controller?.start('d')}
      onTouchEnd={() => controller?.end('d')}
      src={require('./lf2_built_in_data/sprite/touch_btn_d.png')}
      alt='defense'
      draggable={false}
      style={{ width: 64, height: 64 }} />
  </>
}
export default App;
