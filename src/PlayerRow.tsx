import { useEffect, useRef, useState } from 'react';
import LF2 from './LF2/LF2';
import { Entity, IEntityCallbacks } from './LF2/entity/Entity';
import random_get from './Utils/random_get';
import { PlayerController } from './LF2/controller/PlayerController';
import Select, { ISelectProps } from './LF2/ui/Select';
import TeamSelect from './LF2/ui/TeamSelect';
import CharacterSelect from './LF2/ui/CharacterSelect';
import { TKeyName } from './LF2/controller/BaseController';

export const keys_map: { [x in string]?: Record<TKeyName, string> } = {
  '1': {
    L: 'a',
    R: 'd',
    U: 'w',
    D: 's',
    a: 'r',
    j: 't',
    d: 'y',
  },
  '2': {
    L: 'j',
    R: 'l',
    U: 'i',
    D: 'k',
    a: '[',
    j: ']',
    d: '\\',
  },
  '3': {
    L: 'arrowleft',
    R: 'arrowright',
    U: 'arrowup',
    D: 'arrowdown',
    a: '0',
    j: '.',
    d: 'Enter',
  },
  '4': {
    L: '4',
    R: '6',
    U: '8',
    D: '5',
    a: '/',
    j: '*',
    d: '-',
  }
}

const invalid_keys: Record<TKeyName, string> = {
  L: '',
  R: '',
  U: '',
  D: '',
  a: '',
  j: '',
  d: ''
}
const key_names: Record<TKeyName, string> = {
  U: '上',
  D: '下',
  L: '左',
  R: '右',
  a: '攻',
  j: '跳',
  d: '防'
}
const key_name_arr = Object.keys(key_names) as TKeyName[];
interface Props {
  which: number;
  lf2?: LF2;
  visible?: boolean;
}
export function PlayerRow(props: Props) {
  const { lf2, visible } = props;
  const which = '' + props.which;
  const [editing_key, set_editing_key] = useState<TKeyName | undefined>();
  const [keys, set_keys] = useState<Record<TKeyName, string>>(keys_map[which] ?? invalid_keys)
  const [team, set_team] = useState<string>('');
  const [c_id, set_character_id] = useState<string>('');
  const [player_name, set_player_name] = useState<string>(which);
  const [added, set_added] = useState(false);
  const [key_settings_show, set_key_settings_show] = useState(false);
  const hp_ref = useRef<HTMLSpanElement>(null)
  const callbacks = useRef<IEntityCallbacks>({
    on_hp_changed: (_, hp) => { if (hp_ref.current) hp_ref.current.innerText = ('' + hp) },
    on_mp_changed: (_, mp) => { },
    on_disposed: () => set_added(false),
    on_team_changed: (_, team) => set_team('' + team)
  })
  useEffect(() => {
    if (!lf2) return;
    if (!added) return lf2.remove_player(which)

    let lp = lf2.get_local_player(which);
    if (lp?.data.id !== c_id) {
      const r_c_id = c_id || random_get(lf2.dat_mgr.characters)?.id;
      if (r_c_id) {
        lp = lf2.add_player(which, r_c_id, keys_map[which]) ?? lp;
      }
    }
    if (!lp) return;
    lp.callbacks.add(callbacks.current)
    lp.name = player_name.trim() || '' + which;
    lp.team = team ? Number(team) : Entity.new_team();
    lp.controller = new PlayerController(which, lp, keys)
  }, [which, player_name, team, lf2, c_id, added, keys]);

  useEffect(() => {
    if (!editing_key) return;

    const on_keydown = (e: KeyboardEvent) => {
      e.stopImmediatePropagation();
      e.preventDefault();
      e.stopPropagation();
      if (e.key.toUpperCase() !== 'ESCAPE') {
        if (e.key) set_keys(v => ({ ...v, [editing_key]: e.key }))
      }
      set_editing_key(void 0);
    }
    window.addEventListener('keydown', on_keydown, true);
    return () => window.removeEventListener('keydown', on_keydown, true);

  }, [editing_key])

  if (!lf2 || visible === false) return null;
  const on_name_edit: React.ChangeEventHandler<HTMLInputElement> = e => {
    set_player_name(e.target.value);
  };
  const on_name_blur: React.FocusEventHandler<HTMLInputElement> = e => {
    set_player_name(e.target.value.trim() || which);
  };
  return (
    <div key={which} className='player_row'>
      <span> player { }
        <input
          type='text'
          maxLength={50}
          style={{ width: 75 }}
          placeholder='enter player name'
          value={player_name}
          onChange={on_name_edit}
          onBlur={on_name_blur} />
      </span>
      <span>character:</span>
      <CharacterSelect lf2={lf2} value={c_id} on_changed={set_character_id} />
      <span>team:</span>
      <TeamSelect value={team} on_changed={set_team} />
      <button onClick={() => set_added(v => !v)}>{added ? 'del' : 'add'}</button>
      <span style={{ display: !added ? 'none' : void 0 }}>hp:<span ref={hp_ref} /></span>
      <button onClick={() => set_key_settings_show(v => !v)}>keyboard settings</button>
      {!key_settings_show ? null :
        key_name_arr.map(k => {
          const on_click = () => set_editing_key(v => v === k ? void 0 : k);
          const name = key_names[k]
          const value = editing_key === k ? 'editing...' : keys[k]
          return <button key={k} onClick={on_click}>{name} = {value}</button>
        })
      }
    </div >
  );
}
