import { useEffect, useState } from 'react';
import LF2 from './LF2/LF2';
import { IController } from './LF2/controller/IController';
import { SimpleFollowController } from './LF2/controller/SimpleFollowController';
import { Character } from './LF2/entity/Character';
import { Entity } from './LF2/entity/Entity';

const bot_controllers: { [x in string]?: (e: Character) => IController<Character> } = {
  'SimpleFollow': (e: Character) => new SimpleFollowController(e)
}

export function BlackgroundRow(props: { lf2?: LF2; visible?: boolean }) {
  const { lf2, visible } = props;
  const [bg, set_bg] = useState<string>();
  const [bgm, set_bgm] = useState<string>('');
  const [bgm_list, set_bgm_list] = useState<string[]>([]);
  useEffect(() => {
    if (!lf2) return;
    if (!bgm) lf2.sound_mgr.stop_bgm()
    else lf2.sound_mgr.play_bgm(bgm)
  }, [bgm, lf2]);
  useEffect(() => {
    if (!lf2) return;
    lf2.bgms().then(set_bgm_list)
  }, [lf2]);

  useEffect(() => {
    if (!lf2) return;
    if (bg) lf2.change_bg(bg);
    else lf2.remove_bg();
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

  if (!lf2 || visible === false) return <></>;

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
        <select onChange={e => { set_bg(e.target.value); e.target.blur() }} value={bg}>
          <option value=''>OFF</option>
          {lf2.dat_mgr.backgrounds.map(v => <option value={v.id} key={v.id}>{v.base.name}</option>)}
        </select>
        <button onClick={v => lf2.clear()}>clear</button>
        music:
        <select onChange={e => { set_bgm(e.target.value); e.target.blur() }} value={bgm}>
          <option value=''>OFF</option>
          {bgm_list.map(v => <option key={v} value={v}>{v}</option>)}
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
          onChange={e => { set_weapon_id(e.target.value); e.target.blur() }}>
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
          onChange={e => { set_character_id(e.target.value); e.target.blur() }}>
          <option value=''>Random</option>
          {lf2.dat_mgr.characters.map(v => <option key={v.id} value={v.id}>{v.base.name}</option>)}
        </select>
        team:
        <select value={team} onChange={e => { set_team(e.target.value); e.target.blur() }}>
          <option value=''>independent</option>
          <option value='1'>team 1</option>
          <option value='2'>team 2</option>
          <option value='3'>team 3</option>
          <option value='4'>team 4</option>
        </select>

        controller:
        <select value={controller} onChange={e => { set_controller(e.target.value); e.target.blur() }}>
          <option value=''>OFF</option>
          {Object.keys(bot_controllers).map(v => <option value={v} key={v}>{v}</option>)}
        </select>
        <button onClick={on_click_add_character}>add</button>
      </div>
    </>
  );
}
