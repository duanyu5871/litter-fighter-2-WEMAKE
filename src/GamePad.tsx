import { useEffect, useRef, useState } from 'react';
import { IToggleImgProps, ToggleImgButton } from './Component/ToggleImgButton';
import './GamePad.css';
import LF2 from './LF2/LF2';
import { BaseController, TKeyName } from './LF2/controller/BaseController';
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
    const on_touchmove = (e: TouchEvent) => {
      e.preventDefault();
      for (const { clientX: c_x, clientY: c_y, radiusX: c_x_r, radiusY: c_y_r } of e.touches) {
        const c_c_r = Math.max(Math.min(c_x_r, c_y_r), 15)
        const c_l = c_x - c_c_r;
        const c_r = c_x + c_c_r;
        const c_t = c_y - c_c_r;
        const c_b = c_y + c_c_r;
        for (const { rect, circ, key: k } of rect_infos) {
          // const pressing = (
          //   c_l <= rect.r &&
          //   c_r >= rect.l &&
          //   c_t <= rect.b &&
          //   c_b >= rect.t
          // )
          const pressing =
            Math.pow(circ.x - c_x, 2) + Math.pow(circ.y - c_y, 2) < Math.pow(c_c_r + circ.r, 2)
          if (!!ref_pressing_map.current[k] === pressing)
            continue;
          ref_pressing_map.current[k] = pressing;
          if (pressing) {
            lf2?.layout?.on_player_key_down(player_id, k);
            controller?.start(k);
          } else {
            controller?.end(k);
          }
        }
      }
    }
    document.addEventListener('touchmove', on_touchmove, { passive: false })
    return () => {
      document.removeEventListener('contextmenu', on_contextmenu);
      document.removeEventListener('touchmove', on_touchmove);
    }
  }, [controller, lf2, player_id])

  if (!player_id) return <></>;

  const touch_props = (key: TKeyName): IToggleImgProps => {
    const on_touch_end = () => {
      if (!ref_pressing_map.current[key])
        return;
      ref_pressing_map.current[key] = false;
      controller?.end(key);
    }
    return {
      onPointerDown: () => {
        if (ref_pressing_map.current[key])
          return;
        ref_pressing_map.current[key] = true;
        lf2?.layout?.on_player_key_down(player_id, key);
        controller?.start(key);
      },
      onPointerCancel: on_touch_end,
      onPointerUp: on_touch_end
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
