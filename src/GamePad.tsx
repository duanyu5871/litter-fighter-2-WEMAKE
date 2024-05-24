import { useEffect, useRef, useState } from 'react';
import { IToggleImgProps, ToggleImgButton } from './Component/ToggleImgButton';
import './GamePad.css';
import LF2 from './LF2/LF2';
import { BaseController, KEY_NAME_LIST, TKeyName } from './LF2/controller/BaseController';
export interface IGamePadProps {
  lf2?: LF2;
  player_id?: string;
}
export default function GamePad(props: IGamePadProps) {
  const { player_id, lf2 } = props;
  const [controller, set_controller] = useState<BaseController | undefined>(void 0);
  const ref_btn_U = useRef<HTMLButtonElement>(null);
  const ref_btn_D = useRef<HTMLButtonElement>(null);
  const ref_btn_L = useRef<HTMLButtonElement>(null);
  const ref_btn_R = useRef<HTMLButtonElement>(null);
  const ref_btn_a = useRef<HTMLButtonElement>(null);
  const ref_btn_j = useRef<HTMLButtonElement>(null);
  const ref_btn_d = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!lf2 || !player_id) return;
    return lf2.world.callbacks.add({
      on_player_character_add(add_player_id) {
        if (add_player_id !== player_id) return;
        set_controller(lf2.player_characters.get(player_id)?.controller);
      },
      on_player_character_del(del_player_id) {
        if (del_player_id !== player_id) return;
        set_controller(void 0);
      },
    });
  }, [lf2, player_id]);


  const ref_pressing_map = useRef<{ [x in TKeyName]?: boolean }>({});
  useEffect(() => {
    if (!player_id || !lf2) return;

    const on_contextmenu = (e: MouseEvent) => {
      e.preventDefault();
    }
    document.addEventListener('contextmenu', on_contextmenu, { passive: false })

    type TRect = { l: number, r: number, t: number, b: number }
    type TCirc = { x: number, y: number, r: number }
    const get_rect = (ele: React.RefObject<HTMLButtonElement>): TRect => {
      if (!ele.current) return { l: 0, t: 0, r: 0, b: 0 };
      const { x, y, width, height } = ele.current.getBoundingClientRect();
      return { l: x, t: y, r: x + width, b: y + height }
    }
    const get_circ = (ele: React.RefObject<HTMLButtonElement>): TCirc => {
      if (!ele.current) return { x: 0, y: 0, r: 0 };
      const { x, y, width, height } = ele.current.getBoundingClientRect();
      return { x: x + width / 2, y: y + height / 2, r: width / 2 }
    }
    const rect_infos: { key: TKeyName, rect: TRect, circ: TCirc }[] = [
      { key: 'U' as TKeyName, rect: get_rect(ref_btn_U), circ: get_circ(ref_btn_U) },
      { key: 'D' as TKeyName, rect: get_rect(ref_btn_D), circ: get_circ(ref_btn_D) },
      { key: 'L' as TKeyName, rect: get_rect(ref_btn_L), circ: get_circ(ref_btn_L) },
      { key: 'R' as TKeyName, rect: get_rect(ref_btn_R), circ: get_circ(ref_btn_R) },
      { key: 'a' as TKeyName, rect: get_rect(ref_btn_a), circ: get_circ(ref_btn_a) },
      { key: 'j' as TKeyName, rect: get_rect(ref_btn_j), circ: get_circ(ref_btn_j) },
      { key: 'd' as TKeyName, rect: get_rect(ref_btn_d), circ: get_circ(ref_btn_d) }
    ]

    function copy_touch(touch: Touch) {
      return {
        id: touch.identifier,
        x: touch.pageX,
        y: touch.pageY,
        r: Math.min(touch.radiusX, touch.radiusY),
        end: false,
      };
    }
    const touches: ReturnType<typeof copy_touch>[] = [];

    const find_touch_index = (touch_id: number) => {
      return touches.findIndex(v => v.id === touch_id)
    }

    const handle_touchs = () => {
      const next_pressing_map: { [x in TKeyName]?: boolean } = {};
      for (const t of touches) {
        for (const { circ, key: k } of rect_infos) {
          if (!next_pressing_map[k])
            next_pressing_map[k] = Math.pow(circ.x - t.x, 2) + Math.pow(circ.y - t.y, 2) < Math.pow(t.r + circ.r, 2);
        }
      }
      for (const k of KEY_NAME_LIST) {
        if (ref_pressing_map.current[k] && !next_pressing_map[k]) {
          controller?.end(k);
        } else if (!ref_pressing_map.current[k] && next_pressing_map[k]) {
          lf2?.layout?.on_player_key_down(player_id, k);
          controller?.start(k);
        }
      }
      ref_pressing_map.current = next_pressing_map;
    }
    const on_touch_start = (e: TouchEvent) => {
      for (const t of e.changedTouches) {
        touches.push(copy_touch(t));
      }
      handle_touchs()
    }
    const on_touch_move = (e: TouchEvent) => {
      for (const t of e.changedTouches) {
        const idx = find_touch_index(t.identifier);
        if (idx >= 0) touches.splice(idx, 1, copy_touch(t));
      }
      handle_touchs()
    }
    const on_touch_end = (e: TouchEvent) => {
      for (const t of e.changedTouches) {
        const idx = find_touch_index(t.identifier);
        if (idx >= 0) touches.splice(idx, 1);
      }
      handle_touchs()
    }
    const on_touch_cancel = (e: TouchEvent) => {
      for (const t of e.changedTouches) {
        const idx = find_touch_index(t.identifier);
        if (idx >= 0) touches.splice(idx, 1);
      }
      handle_touchs()
    }


    document.addEventListener('touchstart', on_touch_start, { passive: false })
    document.addEventListener('touchmove', on_touch_move, { passive: false })
    document.addEventListener('touchend', on_touch_end, { passive: false })
    document.addEventListener('touchcancel', on_touch_cancel, { passive: false })
    return () => {
      document.removeEventListener('contextmenu', on_contextmenu);
      document.removeEventListener('touchstart', on_touch_start);
      document.addEventListener('touchmove', on_touch_move)
      document.removeEventListener('touchend', on_touch_end);
      document.removeEventListener('touchcancel', on_touch_end);
    }
  }, [controller, lf2, player_id])

  if (!player_id) return <></>;

  const touch_props = (key: TKeyName): IToggleImgProps => {
    // const on_touch_end = () => {
    //   if (!ref_pressing_map.current[key])
    //     return;
    //   ref_pressing_map.current[key] = false;
    //   controller?.end(key);
    // }
    return {
      // onPointerDown: () => {
      //   if (ref_pressing_map.current[key])
      //     return;
      //   ref_pressing_map.current[key] = true;
      //   lf2?.layout?.on_player_key_down(player_id, key);
      //   controller?.start(key);
      // },
      // onPointerCancel: on_touch_end,
      // onPointerUp: on_touch_end,
      style: { 'pointerEvents': 'none' },
      disabled: true
    }
  };
  return (
    <>
      <div className='left_pad'>
        <ToggleImgButton
          className='btn_up'
          ref={ref_btn_U}
          {...touch_props('U')}
          src={[require('./touch_btn_arrow.png')]}
          alt='up'
          draggable={false} />
        <ToggleImgButton
          className='btn_down'
          ref={ref_btn_D}
          {...touch_props('D')}
          src={[require('./touch_btn_arrow.png')]}
          alt='down'
          draggable={false} />
        <ToggleImgButton
          className='btn_left'
          ref={ref_btn_L}
          {...touch_props('L')}
          src={[require('./touch_btn_arrow.png')]}
          alt='left'
          draggable={false} />
        <ToggleImgButton
          className='btn_right'
          ref={ref_btn_R}
          {...touch_props('R')}
          src={[require('./touch_btn_arrow.png')]}
          alt='right'
          draggable={false} />
      </div>
      <div className='right_pad'>
        <ToggleImgButton
          className='btn_attack'
          ref={ref_btn_a}
          {...touch_props('a')}
          src={[require('./touch_btn_a.png')]}
          alt='attack'
          draggable={false} />
        <ToggleImgButton
          className='btn_jump'
          ref={ref_btn_j}
          {...touch_props('j')}
          src={[require('./touch_btn_j.png')]}
          alt='jump'
          draggable={false} />
        <ToggleImgButton
          className='btn_defense'
          ref={ref_btn_d}
          {...touch_props('d')}
          src={[require('./touch_btn_d.png')]}
          alt='defense'
          draggable={false} />
      </div>
    </>
  );
}
