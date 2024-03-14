import { useEffect, useState } from 'react';
import LF2 from './G/LF2';
import { Entity } from './G/entity/Entity';

export function BlackgroundRow(props: { lf2?: LF2; }) {
  const { lf2 } = props;
  const [bg, set_bg] = useState<string>();

  useEffect(() => {
    if (!lf2) return;
    set_bg(lf2.dat_mgr.backgrounds[0].id);
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
        <select
          value={c_id}
          onChange={e => set_character_id(e.target.value)}>
          <option value=''>Random</option>
          {lf2.dat_mgr.characters.map(v => <option key={v.id} value={v.id}>{v.base.name}</option>)}
        </select>
        <select value={team} onChange={e => set_team(e.target.value)}>
          <option value=''>independent</option>
          <option value='1'>team 1</option>
          <option value='2'>team 2</option>
          <option value='3'>team 3</option>
          <option value='4'>team 4</option>
        </select>
        <button onClick={on_click_add_character}>add</button>
      </div>
    </>
  );
}
