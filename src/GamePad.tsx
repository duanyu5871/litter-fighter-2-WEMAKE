import { useEffect, useState } from 'react';
import { ToggleImgButton } from './Component/ToggleImgButton';
import LF2 from './LF2/LF2';
import { BaseController, TKeyName } from './LF2/controller/BaseController';
import './GamePad.css'
export interface IGamePadProps {
  lf2?: LF2;
  player_id?: string;
}
export default function GamePad(props: IGamePadProps) {
  const { player_id, lf2 } = props;
  const [controller, set_controller] = useState<BaseController | undefined>(void 0);

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
  if (!player_id) return <></>;

  const touch_props = (key: TKeyName) => ({
    onTouchStart: () => {
      lf2?.layout?.on_player_key_down(player_id, key);
      controller?.start(key);
    },
    onTouchCancel: () => controller?.end(key),
    onTouchEnd: () => controller?.end(key),
  });
  return (
    <>
      <div className='left_pad'>
        <ToggleImgButton
          className='btn_up'
          {...touch_props('U')}
          src={[require('./touch_btn_arrow.png')]}
          alt='up'
          draggable={false} />
        <ToggleImgButton
          className='btn_down'
          {...touch_props('D')}
          src={[require('./touch_btn_arrow.png')]}
          alt='down'
          draggable={false} />
        <ToggleImgButton
          className='btn_left'
          {...touch_props('L')}
          src={[require('./touch_btn_arrow.png')]}
          alt='left'
          draggable={false} />
        <ToggleImgButton
          className='btn_right'
          {...touch_props('R')}
          src={[require('./touch_btn_arrow.png')]}
          alt='right'
          draggable={false} />
      </div>
      <div className='right_pad'>
        <ToggleImgButton
          className='btn_attack'
          {...touch_props('a')}
          src={[require('./touch_btn_a.png')]}
          alt='attack'
          draggable={false} />
        <ToggleImgButton
          className='btn_jump'
          {...touch_props('j')}
          src={[require('./touch_btn_j.png')]}
          alt='jump'
          draggable={false} />
        <ToggleImgButton
          className='btn_defense'
          {...touch_props('d')}
          src={[require('./touch_btn_d.png')]}
          alt='defense'
          draggable={false} />
      </div>
    </>
  );
}
