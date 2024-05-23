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
  const ref_btn_up = useRef<HTMLButtonElement>(null);
  const ref_btn_down = useRef<HTMLButtonElement>(null);
  const ref_btn_left = useRef<HTMLButtonElement>(null);
  const ref_btn_right = useRef<HTMLButtonElement>(null);
  const ref_btn_atk = useRef<HTMLButtonElement>(null);
  const ref_btn_jmp = useRef<HTMLButtonElement>(null);
  const ref_btn_def = useRef<HTMLButtonElement>(null);

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

  useEffect(() => {
    if (!player_id || !lf2) return;

    const on_contextmenu = (e: MouseEvent) => {
      e.preventDefault();
    }
    document.addEventListener('contextmenu', on_contextmenu, { passive: false })

    const aaa = { x: 0, y: 0, width: 0, height: 0 };
    const rect_infos = [
      { k: 'U' as TKeyName, r: (ref_btn_up.current?.getBoundingClientRect() || aaa) },
      { k: 'D' as TKeyName, r: (ref_btn_down.current?.getBoundingClientRect() || aaa) },
      { k: 'L' as TKeyName, r: (ref_btn_left.current?.getBoundingClientRect() || aaa) },
      { k: 'R' as TKeyName, r: (ref_btn_right.current?.getBoundingClientRect() || aaa) },
      { k: 'a' as TKeyName, r: (ref_btn_atk.current?.getBoundingClientRect() || aaa) },
      { k: 'j' as TKeyName, r: (ref_btn_jmp.current?.getBoundingClientRect() || aaa) },
      { k: 'd' as TKeyName, r: (ref_btn_def.current?.getBoundingClientRect() || aaa) },
    ]
    const on_touchmove = (e: TouchEvent) => {
      e.preventDefault();

      for (const { clientX: cx, clientY: cy } of e.touches) {
        for (const { r: { x, width, y, height }, k } of rect_infos) {
          if (cx >= x && cx <= x + width && cy >= y && cy <= y + height) {
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

  const touch_props = (key: TKeyName): IToggleImgProps => ({
    onPointerDown: () => {
      console.log(ref_btn_right)
      lf2?.layout?.on_player_key_down(player_id, key);
      controller?.start(key);
    },
    onPointerCancel: () => controller?.end(key),
    onPointerUp: () => controller?.end(key),
    onPointerOver: () => { console.log('onPointerOver') },
    onPointerEnter: () => { console.log('onPointerEnter') },
    onPointerLeave: () => { console.log('onPointerLeave') }
  });
  return (
    <>
      <div className='left_pad'>
        <ToggleImgButton
          className='btn_up'
          ref={ref_btn_up}
          {...touch_props('U')}
          src={[require('./touch_btn_arrow.png')]}
          alt='up'
          draggable={false} />
        <ToggleImgButton
          className='btn_down'
          ref={ref_btn_down}
          {...touch_props('D')}
          src={[require('./touch_btn_arrow.png')]}
          alt='down'
          draggable={false} />
        <ToggleImgButton
          className='btn_left'
          ref={ref_btn_left}
          {...touch_props('L')}
          src={[require('./touch_btn_arrow.png')]}
          alt='left'
          draggable={false} />
        <ToggleImgButton
          className='btn_right'
          ref={ref_btn_right}
          {...touch_props('R')}
          src={[require('./touch_btn_arrow.png')]}
          alt='right'
          draggable={false} />
      </div>
      <div className='right_pad'>
        <ToggleImgButton
          className='btn_attack'
          ref={ref_btn_atk}
          {...touch_props('a')}
          src={[require('./touch_btn_a.png')]}
          alt='attack'
          draggable={false} />
        <ToggleImgButton
          className='btn_jump'
          ref={ref_btn_jmp}
          {...touch_props('j')}
          src={[require('./touch_btn_j.png')]}
          alt='jump'
          draggable={false} />
        <ToggleImgButton
          className='btn_defense'
          ref={ref_btn_def}
          {...touch_props('d')}
          src={[require('./touch_btn_d.png')]}
          alt='defense'
          draggable={false} />
      </div>
    </>
  );
}
