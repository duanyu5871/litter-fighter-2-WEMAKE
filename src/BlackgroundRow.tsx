import { useEffect, useState } from 'react';
import LF2 from './LF2/LF2';
import { SimpleFollowController } from './LF2/controller/SimpleFollowController';
import { Character } from './LF2/entity/Character';
import { Entity } from './LF2/entity/Entity';
import { sound_mgr } from './LF2/loader/SoundMgr';
import { IController } from './LF2/controller/IController';

const bot_controllers: { [x in string]?: (e: Character) => IController<Character> } = {
  'SimpleFollow': (e: Character) => new SimpleFollowController(e)
}

export function BlackgroundRow(props: { lf2?: LF2; }) {
  const { lf2 } = props;
  const [bg, set_bg] = useState<string>();
  const [bgm, set_bgm] = useState<string>('');
  useEffect(() => {
    if (!bgm) sound_mgr.stop_bgm()
    else sound_mgr.play_bgm(bgm)
  }, [bgm]);
  useEffect(() => {
    if (!lf2) return;
  }, [lf2]);

  useEffect(() => {
    if (!lf2 || !bg) return;
    lf2.change_bg(bg);
  }, [lf2, bg]);

  const min_rwn = 1;
  const max_rwn = 100;
  const [rwn, set_rwn] = useState(10)

  const min_rcn = 1;
  const max_rcn = 100;
  const [rcn, set_rcn] = useState(10)

  const [weapon_id, set_weapon_id] = useState<string>('');
  const [c_id, set_character_id] = useState<string>('');
  const [team, set_team] = useState<string>('');
  const [controller, set_controller] = useState<string>('');

  if (!lf2) return <></>;

  const on_click_add_weapon = () => {
    (
      weapon_id ?
        lf2.add_weapon(weapon_id, rwn) :
        lf2.add_random_weapon(rwn)
    )
  }
  const on_click_add_character = () => {
    const r_team = team ? Number(team) : Entity.new_team();
    (
      c_id ?
        lf2.add_character(c_id, rcn, r_team) :
        lf2.add_random_character(rcn, r_team)
    ).forEach(e => {
      e.name = 'bot';

      const controller_creator = bot_controllers[controller];
      if (controller_creator) e.controller = controller_creator(e);
    })
  }
  return (
    <>
      <div className='background_settings_row'>
        background:
        <select onChange={e => set_bg(e.target.value)} value={bg}>
          {lf2.dat_mgr.backgrounds.map(v => <option value={v.id} key={v.id}>{v.base.name}</option>)}
        </select>
        <button onClick={v => lf2.clear()}>clear</button>
        music:
        <select onChange={e => set_bgm(e.target.value)} value={bgm}>
          <option value=''> OFF </option>
          <option value={require('./lf2_data/bgm/boss1.wma.ogg')}> boss1 </option>
          <option value={require('./lf2_data/bgm/boss2.wma.ogg')}> boss2 </option>
          <option value={require('./lf2_data/bgm/main.wma.ogg')}> main </option>
          <option value={require('./lf2_data/bgm/stage1.wma.ogg')} >stage1 </option>
          <option value={require('./lf2_data/bgm/stage2.wma.ogg')} >stage2 </option>
          <option value={require('./lf2_data/bgm/stage3.wma.ogg')} >stage3 </option>
          <option value={require('./lf2_data/bgm/stage4.wma.ogg')} >stage4 </option>
          <option value={require('./lf2_data/bgm/stage5.wma.ogg')} >stage5 </option>
        </select>
      </div>

      <div className='background_settings_row'>
        weapon:
        <input type='number' style={{ width: 40 }}
          min={min_rwn} max={max_rwn} step={1} value={rwn}
          onChange={e => set_rwn(Number(e.target.value))}
          onBlur={() => set_rwn(v => Math.min(Math.max(Math.floor(v), min_rwn), max_rwn))} />
        <select
          value={weapon_id}
          onChange={e => set_weapon_id(e.target.value)}>
          <option value=''>Random</option>
          {lf2.dat_mgr.weapons.map(v => <option key={v.id} value={v.id}>{v.base.name}</option>)}
        </select>
        <button onClick={on_click_add_weapon}>add</button>
      </div>

      <div className='background_settings_row'>
        bot:
        <input type='number' style={{ width: 40 }}
          min={min_rcn} max={max_rcn} step={1} value={rcn}
          onChange={e => set_rcn(Number(e.target.value))}
          onBlur={() => set_rcn(v => Math.min(Math.max(Math.floor(v), min_rcn), max_rcn))} />
        character:
        <select
          value={c_id}
          onChange={e => set_character_id(e.target.value)}>
          <option value=''>Random</option>
          {lf2.dat_mgr.characters.map(v => <option key={v.id} value={v.id}>{v.base.name}</option>)}
        </select>
        team:
        <select value={team} onChange={e => set_team(e.target.value)}>
          <option value=''>independent</option>
          <option value='1'>team 1</option>
          <option value='2'>team 2</option>
          <option value='3'>team 3</option>
          <option value='4'>team 4</option>
        </select>

        controller:
        <select value={controller} onChange={e => set_controller(e.target.value)}>
          <option value=''>OFF</option>
          {Object.keys(bot_controllers).map(v => <option value={v}>{v}</option>)}
        </select>
        <button onClick={on_click_add_character}>add</button>
      </div>
    </>
  );
}
