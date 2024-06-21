import { useEffect, useRef, useState } from 'react';
import './App.css';
import { Button } from './Component/Button';
import Combine from './Component/Combine';
import { Input } from './Component/Input';
import Select from './Component/Select';
import Show from './Component/Show';
import Titled from './Component/Titled';
import { ToggleButton } from "./Component/ToggleButton";
import { ToggleImgButton } from './Component/ToggleImgButton';
import { useShortcut } from './Component/useShortcut';
import EditorView from './EditorView';
import GamePad from './GamePad';
import LF2 from './LF2/LF2';
import Invoker from './LF2/base/Invoker';
import { Defines } from './LF2/defines/defines';
import FullScreen from './LF2/dom/FullScreen';
import { GameOverlay } from './LF2/dom/GameOverlay';
import Zip from './LF2/dom/download_zip';
import { ILayoutInfo } from './LF2/layout/ILayoutInfo';
import { fisrt } from './LF2/utils/container_help';
import { arithmetic_progression } from './LF2/utils/math/arithmetic_progression';
import { Log } from './Log';
import { PlayerRow } from './PlayerRow';
import SettingsRows from './SettingsRows';
import open_file from './Utils/open_file';
import './game_ui.css';
import './init';
import { useLocalBoolean, useLocalNumber, useLocalString } from './useLocalStorage';
import { is_weapon } from './LF2/entity/type_check';
import float_equal from './LF2/utils/math/float_equal';
import img_btn_0_0 from './assets/btn_0_0.png'
import img_btn_0_1 from './assets/btn_0_1.png'
import img_btn_0_2 from './assets/btn_0_2.png'
import img_btn_0_3 from './assets/btn_0_3.png'
import img_btn_1_0 from './assets/btn_1_0.png'
import img_btn_1_1 from './assets/btn_1_1.png'
import img_btn_1_2 from './assets/btn_1_2.png'
import img_btn_1_3 from './assets/btn_1_3.png'
import img_btn_2_0 from './assets/btn_2_0.png'
import img_btn_2_1 from './assets/btn_2_1.png'
import img_btn_2_2 from './assets/btn_2_2.png'
import img_btn_2_3 from './assets/btn_2_3.png'
import img_btn_3_0 from './assets/btn_3_0.png'
import img_btn_3_1 from './assets/btn_3_1.png'
import img_btn_3_2 from './assets/btn_3_2.png'
import img_btn_3_3 from './assets/btn_3_3.png'

const fullscreen = new FullScreen()
function App() {
  const _overlay_ref = useRef<HTMLDivElement>(null)
  const _canvas_ref = useRef<HTMLCanvasElement>(null)
  const _game_contiainer_ref = useRef<HTMLDivElement>(null)

  const lf2_ref = useRef<LF2 | undefined>();

  const [editor_open, set_editor_open] = useState(false);
  const [game_overlay, set_game_overlay] = useLocalBoolean('game_overlay', false);
  const [showing_panel, set_showing_panel] = useLocalString<'stage' | 'bg' | 'weapon' | 'bot' | 'player' | ''>('showing_panel', '');
  const [control_panel_visible, set_control_panel_visible] = useLocalBoolean('control_panel', false);

  const [cheat_1, _set_cheat_1] = useLocalBoolean('cheat_1', false);
  const [cheat_2, _set_cheat_2] = useLocalBoolean('cheat_2', false);
  const [cheat_3, _set_cheat_3] = useLocalBoolean('cheat_3', false);

  const [loading, set_loading] = useState(false);
  const [loaded, set_loaded] = useState(false);
  const [paused, _set_paused] = useState(false);

  const [muted, _set_muted] = useLocalBoolean('total_muted', false);
  const [bgm_muted, _set_bgm_muted] = useLocalBoolean('bgm_muted', false);
  const [sound_muted, _set_sound_muted] = useLocalBoolean('sound_muted', false);
  const [volume, _set_volume] = useLocalNumber<number>('total_volume', 1);
  const [bgm_volume, _set_bgm_volume] = useLocalNumber<number>('bgm_volume', 1);
  const [sound_volume, _set_sound_volume] = useLocalNumber<number>('sound_volume', 1);

  const [bg_id, _set_bg_id] = useState(Defines.VOID_BG.id);

  const [render_size_mode, set_render_size_mode] = useLocalString<'fixed' | 'fill' | 'cover' | 'contain'>('render_size_mode', 'contain');
  const [render_fixed_scale, set_render_fixed_scale] = useLocalNumber<number>('render_fixed_scale', 1);
  const [custom_render_fixed_scale, set_custom_render_fixed_scale] = useLocalNumber<number>('custom_render_fixed_scale', 1);
  const [v_align, set_v_align] = useLocalNumber<number>('v_align', 0.5);
  const [h_align, set_h_align] = useLocalNumber<number>('h_align', 0.5);
  const [custom_h_align, set_custom_h_align] = useLocalNumber<number>('custom_h_align', 0.5);
  const [custom_v_align, set_custom_v_align] = useLocalNumber<number>('custom_v_align', 0.5);
  const [debug_ui_pos, set_debug_ui_pos] = useLocalString<'left' | 'right' | 'top' | 'bottom'>('debug_ui_pos', 'bottom');
  const [touch_pad_on, set_touch_pad_on] = useLocalString<string>('touch_pad_on', '');
  const [is_fullscreen, _set_is_fullscreen] = useState(false);
  const [gravity, _set_gravity] = useState(0);

  const cln = document.body.parentElement?.className;
  useEffect(() => {
    if (!cln) return;
    if (cln.indexOf("portrait") >= 0)
      set_v_align(0.3);
  }, [cln, set_v_align])

  const update_once = () => {
    const lf2 = lf2_ref.current;
    lf2?.world.set_paused(true);
    lf2?.world.update_once();
  }

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

  const [layout_id, _set_layout] = useState<string | undefined>(void 0);
  const [layouts, set_layouts] = useState<Readonly<ILayoutInfo>[]>([{ id: '', name: '无页面' }]);
  useEffect(() => {
    const ele_canvas = _canvas_ref.current!;
    const ele_overlay = _overlay_ref.current!;

    if (!lf2_ref.current) {
      const lf2 = (window as any).lf2 = lf2_ref.current = new LF2(ele_canvas);
      new GameOverlay(lf2.world, ele_overlay)

      lf2.load_layouts().then((layouts = []) => {
        const layout_data_list = layouts.map(l => ({ id: l.id, name: l.name }))
        layout_data_list.unshift({ id: '', name: '无页面' })
        set_layouts(layout_data_list);
        if (layout_data_list.length > 1)
          _set_layout(layout_data_list[1].id)
      }).catch(e => {
        console.error((e as any).target)
      })
    }
    const lf2 = lf2_ref.current;
    lf2.sounds.set_muted(muted);
    lf2.sounds.set_volume(volume);
    lf2.sounds.set_bgm_muted(bgm_muted);
    lf2.sounds.set_bgm_volume(bgm_volume);
    lf2.sounds.set_sound_muted(sound_muted);
    lf2.sounds.set_sound_volume(sound_volume);
    _set_gravity(lf2.world.gravity);
    _set_cheat_1(lf2.is_cheat_enabled(Defines.Cheats.LF2_NET));
    _set_cheat_2(lf2.is_cheat_enabled(Defines.Cheats.HERO_FT));
    _set_cheat_3(lf2.is_cheat_enabled(Defines.Cheats.GIM_INK));
    _set_bg_id(lf2.world.stage.bg.id)
    const on_touchstart = () => {
      set_touch_pad_on(fisrt(lf2.player_infos.keys())!)
    }
    window.addEventListener('touchstart', on_touchstart, { once: true })

    _set_is_fullscreen(!!fullscreen.element)
    _set_paused(lf2.world.paused)
    return new Invoker().add(
      () => window.removeEventListener('touchstart', on_touchstart),
      fullscreen.callbacks.add({
        onChange: e => _set_is_fullscreen(!!e),
      }),
      lf2.world.callbacks.add({
        on_stage_change: (s) => _set_bg_id(s.bg.id),
        on_pause_change: (v) => _set_paused(v),
        on_gravity_change: v => _set_gravity(v),
      }),
      lf2.callbacks.add({
        on_layout_changed: v => _set_layout(v?.id ?? ''),
        on_loading_start: () => set_loading(true),
        on_loading_end: () => {
          set_loaded(true);
          set_loading(false);
        },
        on_cheat_changed: (cheat_name, enabled) => {
          switch (cheat_name) {
            case Defines.Cheats.LF2_NET: _set_cheat_1(enabled); break;
            case Defines.Cheats.HERO_FT: _set_cheat_2(enabled); break;
            case Defines.Cheats.GIM_INK: _set_cheat_3(enabled); break;
          }
        },
      }),
      lf2.sounds.callbacks.add({
        on_muted_changed: _set_muted,
        on_bgm_muted_changed: _set_bgm_muted,
        on_sound_muted_changed: _set_sound_muted,
        on_volume_changed: _set_volume,
        on_bgm_volume_changed: _set_bgm_volume,
        on_sound_volume_changed: _set_sound_volume
      })
    ).clear_fn();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const on_click_load_local_zip = () => {
    const lf2 = lf2_ref.current;
    if (!lf2) return;
    open_file({ accept: '.zip' })
      .then(v => Zip.read_file(v[0]))
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

  const lf2 = lf2_ref.current;
  useShortcut('F1', 0, () => lf2?.world.set_paused(!paused));
  useShortcut('F2', 0, () => update_once());
  useShortcut('F4', 0, () => lf2?.pop_layout());
  useShortcut('F5', 0, () => set_fast_forward(!fast_forward));

  useShortcut('F6', 0, () => { if (lf2) lf2.infinity_mp = !lf2.infinity_mp });
  useShortcut('F7', 0, () => { if (lf2) for (const e of lf2.world.entities) e.hp = e.max_hp; });
  useShortcut('F8', 0, () => lf2?.add_random_weapon(9));
  useShortcut('F9', 0, () => lf2?.world.stage.kill_all_enemies());
  useShortcut('F10', 0, () => { if (lf2) for (const e of lf2.world.entities) if (is_weapon(e)) e.hp = 0; });

  useShortcut('F11', 0, () => toggle_fullscreen());
  useShortcut('ctrl+F1', 0, () => set_control_panel_visible(v => !v));
  useShortcut('ctrl+F2', 0, () => set_show_indicators(v => !v));
  useShortcut('ctrl+F3', 0, () => set_game_overlay(v => !v));

  return (
    <div className="App">
      <div className='game_contiainer' ref={_game_contiainer_ref}>
        <canvas ref={_canvas_ref} tabIndex={-1} className='game_canvas' width={794} height={450} draggable={false} />
        <div className='game_overlay' ref={_overlay_ref} style={{ display: !game_overlay ? 'none' : void 0 }} />
        <GamePad player_id={touch_pad_on} lf2={lf2} />
      </div>
      <div className='game_overlay_ui'>
        <Show show={lf2?.is_cheat_enabled(Defines.Cheats.GIM_INK) || true}>
          <ToggleImgButton
            checked={control_panel_visible}
            onClick={() => set_control_panel_visible(v => !v)}
            src={[img_btn_1_2, img_btn_1_3]} />
        </Show>
        <ToggleImgButton
          checked={is_fullscreen}
          onClick={() => toggle_fullscreen()}
          src={[img_btn_3_1, img_btn_3_2]} />
        <ToggleImgButton
          checked={bgm_muted}
          onClick={() => lf2?.sounds?.set_bgm_muted(!bgm_muted)}
          src={[img_btn_2_0, img_btn_3_0]} />
        <ToggleImgButton
          checked={sound_muted}
          onClick={() => lf2?.sounds?.set_sound_muted(!sound_muted)}
          src={[img_btn_0_3, img_btn_1_0]} />
        <Show show={bg_id !== Defines.VOID_BG.id}>
          <ToggleImgButton
            checked={paused}
            onClick={() => lf2?.world.set_paused(!paused)}
            src={[img_btn_2_1, img_btn_2_2]} />
        </Show>
        <Show show={layouts.length > 1 && !loading && layout_id !== 'launch' && layout_id !== 'ctrl_settings'}>
          <ToggleImgButton
            onClick={() => lf2?.push_layout("ctrl_settings")}
            src={[img_btn_1_1, img_btn_1_1]} />
        </Show>
        <Show show={layout_id && Number(lf2?.layout_stacks.length) > 1}>
          <ToggleImgButton
            shortcut='F4'
            onClick={() => lf2?.pop_layout()}
            src={[img_btn_2_3]} />
        </Show>
      </div>
      <Show.Div className={'debug_ui debug_ui_' + debug_ui_pos} show={control_panel_visible}>
        <div className='settings_row'>
          <Button onClick={on_click_download_zip}>下载数据包</Button>
          <Button onClick={on_click_load_local_zip} disabled={loading}>加载数据包</Button>
          <Button onClick={on_click_load_builtin} disabled={loading}>加载内置数据</Button>
          <Button onClick={() => set_editor_open(true)}>查看dat文件</Button>
          <Select
            items={['top', 'bottom', 'left', 'right'] as const}
            option={v => [v, '位置：' + v]}
            value={debug_ui_pos}
            on_changed={set_debug_ui_pos} />

          <Button
            style={{ marginLeft: 'auto' }}
            onClick={() => set_control_panel_visible(false)}>
            ✕
          </Button>
        </div>
        <div className='settings_row'>
          <Combine>
            <ToggleButton
              onToggle={v => lf2?.sounds.set_muted(v)}
              checked={muted}>
              <>音量</>
              <>静音✓</>
            </ToggleButton>
            <Show show={!muted}>
              <Input
                type='number'
                min={0}
                max={100}
                step={1}
                value={Math.ceil(volume * 100)}
                onChange={e => lf2?.sounds.set_volume(Number(e.target.value) / 100)} />
            </Show>
          </Combine>
          <Combine>
            <ToggleButton
              onToggle={v => lf2?.sounds.set_bgm_muted(v)}
              checked={bgm_muted}>
              <>BGM✓</>
              <>BGM</>
            </ToggleButton>
            <Show show={!bgm_muted}>
              <Input
                type='number'
                min={0}
                max={100}
                step={1}
                value={Math.ceil(bgm_volume * 100)}
                onChange={e => lf2?.sounds.set_bgm_volume(Number(e.target.value) / 100)} />
            </Show>
          </Combine>
          <Combine>
            <ToggleButton
              onToggle={v => lf2?.sounds.set_sound_muted(v)}
              checked={sound_muted}>
              <>Sound✓</>
              <>Sound</>
            </ToggleButton>
            <Show show={!sound_muted}>
              <Input
                type='number'
                min={0}
                max={100}
                step={1}
                value={Math.ceil(sound_volume * 100)}
                onChange={e => lf2?.sounds.set_sound_volume(Number(e.target.value) / 100)} />
            </Show>
          </Combine>
          <Titled title="重力">
            <Combine>
              <Input
                type='number'
                min={0}
                max={100}
                step={1}
                value={gravity}
                onChange={e => lf2?.world.set_gravity(Number(e.target.value))} />
              <Show show={!float_equal(gravity, Defines.GRAVITY)}>
                <Button onClick={_ => lf2?.world.set_gravity(Defines.GRAVITY)}>
                  重置
                </Button>
              </Show>
            </Combine>
          </Titled>
        </div>
        <div className='settings_row'>
          <Select
            value={layout_id}
            on_changed={(v: string) => lf2?.set_layout(v)}
            items={layouts}
            option={o => [o.id!, o.name]} />
          <Titled title='Mode'>
            <Select
              value={render_size_mode}
              on_changed={set_render_size_mode}
              items={['fixed', 'fill', 'cover', 'contain'] as const} />
          </Titled>
          <Show show={render_size_mode === 'fixed'}>
            <Titled title='缩放'>
              <Combine>
                <Select
                  value={render_fixed_scale}
                  on_changed={set_render_fixed_scale}
                  items={arithmetic_progression(0, 4, 0.5)}
                  option={i => [i, '✕' + (i || '?')]} />
                <Show show={!render_fixed_scale}>
                  <Input
                    className='render_scale_input'
                    type='number'
                    min={0}
                    step={custom_render_fixed_scale <= 0.5 ? 0.1 : 0.5}
                    value={custom_render_fixed_scale}
                    onChange={e => set_custom_render_fixed_scale(Number(e.target.value))} />
                </Show>
              </Combine>
            </Titled>
          </Show>

          <Show show={render_size_mode !== 'fill'}>
            <Titled title='对齐'>
              <Combine className='render_align'>
                <Select
                  value={v_align}
                  on_changed={set_v_align}
                  items={[-2, 0, 0.5, 1]}
                  option={(v, idx) => [v, v <= -1 ? '?' : ['上', '中', '下'][idx - 1]]} />
                <Show show={v_align < 0}>
                  <Input min={-1} max={2} type='number' step={0.1}
                    value={custom_v_align}
                    onChange={e => set_custom_v_align(Number(e.target.value))} />
                </Show>
                <Select
                  value={h_align}
                  on_changed={set_h_align}
                  items={[-2, 0, 0.5, 1]}
                  option={(v, idx) => [v, v <= -1 ? '?' : ['左', '中', '右'][idx - 1]]} />
                <Show show={h_align < 0}>
                  <Input min={-1} max={2} type='number' step={0.1}
                    value={custom_h_align}
                    onChange={e => set_custom_h_align(Number(e.target.value))} />
                </Show>
              </Combine>
            </Titled>
          </Show>

        </div>
        <div className='settings_row'>
          <ToggleButton title='F1' checked={paused} onClick={() => lf2?.world.set_paused(!paused)}>
            <>游戏暂停</>
            <>游戏暂停✓</>
          </ToggleButton>
          <Button title='F2' onClick={update_once}>
            更新一帧
          </Button>
          <ToggleButton title='F5' checked={fast_forward} onClick={() => set_fast_forward(!fast_forward)}>
            <>不限速度</>
            <>不限速度✓</>
          </ToggleButton>
          <ToggleButton title='ctrl+F2' checked={show_indicators} onClick={() => set_show_indicators(v => !v)}>
            <>指示器</>
            <>指示器✓</>
          </ToggleButton>
          <ToggleButton title='ctrl+F3' checked={game_overlay} onToggle={set_game_overlay} >
            <>游戏覆盖</>
            <>游戏覆盖✓</>
          </ToggleButton>
          <Button onClick={toggle_fullscreen}>
            全屏
          </Button>
        </div>
        <div className='settings_row'>
          <Combine>
            <ToggleButton
              onToggle={() => set_showing_panel(v => v === 'stage' ? '' : 'stage')}
              checked={showing_panel === 'stage'}>
              <>关卡面板</>
              <>关卡面板✓</>
            </ToggleButton>
            <ToggleButton
              onToggle={() => set_showing_panel(v => v === 'bg' ? '' : 'bg')}
              checked={showing_panel === 'bg'}>
              <>背景面板</>
              <>背景面板✓</>
            </ToggleButton>
            <ToggleButton
              onToggle={() => set_showing_panel(v => v === 'weapon' ? '' : 'weapon')}
              checked={showing_panel === 'weapon'}>
              <>武器面板</>
              <>武器面板✓</>
            </ToggleButton>
            <ToggleButton
              onToggle={() => set_showing_panel(v => v === 'bot' ? '' : 'bot')}
              checked={showing_panel === 'bot'}>
              <>Bot面板</>
              <>Bot面板✓</>
            </ToggleButton>
            <ToggleButton
              onToggle={() => set_showing_panel(v => v === 'player' ? '' : 'player')}
              checked={showing_panel === 'player'}>
              <>玩家面板</>
              <>玩家面板✓</>
            </ToggleButton>
          </Combine>
          <ToggleButton
            onToggle={() => lf2?.toggle_cheat_enabled(Defines.Cheats.LF2_NET)}
            checked={cheat_1}>
            <>LF2_NET</>
            <>LF2_NET✓</>
          </ToggleButton>
          <ToggleButton
            onToggle={() => lf2?.toggle_cheat_enabled(Defines.Cheats.HERO_FT)}
            checked={cheat_2}>
            <>HERO_FT</>
            <>HERO_FT✓</>
          </ToggleButton>
          <ToggleButton
            onToggle={() => lf2?.toggle_cheat_enabled(Defines.Cheats.GIM_INK)}
            checked={cheat_3}>
            <>GIM_INK</>
            <>GIM_INK✓</>
          </ToggleButton>
        </div>
        <Show show={showing_panel === 'player'}>
          {Array.from(lf2?.player_infos.values() ?? []).splice(0, 4).map((info, idx) =>
            <PlayerRow
              key={idx}
              lf2={lf2!}
              info={info}
              touch_pad_on={touch_pad_on === info.id}
              on_click_toggle_touch_pad={() => set_touch_pad_on(touch_pad_on === info.id ? '' : info.id)} />
          )}
        </Show>
        <SettingsRows
          lf2={lf2}
          show_stage_settings={showing_panel === 'stage'}
          show_bg_settings={showing_panel === 'bg'}
          show_weapon_settings={showing_panel === 'weapon'}
          show_bot_settings={showing_panel === 'bot'} />
      </Show.Div>
      <EditorView open={editor_open} onClose={() => set_editor_open(false)} />
    </div >
  );
}

export default App;
