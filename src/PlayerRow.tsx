import React, { useEffect, useRef, useState } from 'react';
import { Button } from './Component/Button';
import CharacterSelect from './Component/CharacterSelect';
import { Input } from './Component/Input';
import TeamSelect from './Component/TeamSelect';
import LF2 from './LF2/LF2';
import { IPlayerInfoCallback, PlayerInfo } from './LF2/PlayerInfo';
import { TKeyName } from './LF2/controller/BaseController';
import { PlayerController } from './LF2/controller/LocalHuman';
import { IEntityCallbacks } from './LF2/entity/Entity';
import { new_team } from './LF2/new_id';
import random_get from './js_utils/random_get';

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

  const [keys, set_keys] = useState<Record<TKeyName, string>>(invalid_keys);
  const [player_name, set_player_name] = useState<string>(which);
  const [team, set_team] = useState<string>('');
  const [character_id, set_character_id] = useState<string>('');
  const [added, set_added] = useState(false);
  const [key_settings_show, set_key_settings_show] = useState(false);
  const hp_ref = useRef<HTMLSpanElement>(null)
  const callbacks = useRef<IEntityCallbacks>({
    on_hp_changed: (_, hp) => { if (hp_ref.current) hp_ref.current.innerText = ('' + hp) },
    on_mp_changed: (_, mp) => { },
    on_disposed: () => set_added(false),
    on_team_changed: (_, team) => set_team('' + team)
  })
  const ref_player_info = useRef<PlayerInfo>()

  useEffect(() => {
    if (!lf2) return;
    const player_info = ref_player_info.current = lf2.player_infos.get(which);
    if (!player_info) return;

    set_keys(player_info.keys);
    set_player_name(player_info.name);

    const callback: IPlayerInfoCallback = {
      on_key_changed: (name, key) => set_keys(v => ({ ...v, [name]: key }))
    }
    return player_info.callbacks.add(callback);
  }, [which, lf2]);

  useEffect(() => {
    if (!lf2) return;
    if (!added) return lf2.remove_player(which)
    let lp = lf2.get_local_player(which);
    if (lp?.data.id !== character_id) {
      const r_c_id = character_id || random_get(lf2.dat_mgr.characters)?.id;
      if (r_c_id) {
        lp = lf2.add_player(which, r_c_id) ?? lp;
      }
    }
    if (!lp) return;
    lp.callbacks.add(callbacks.current)
    lp.name = player_name.trim() || '' + which;
    lp.team = team ? Number(team) : new_team();
    lp.controller = new PlayerController(which, lp, keys)
  }, [which, player_name, team, lf2, character_id, added, keys]);

  useEffect(() => {
    if (!editing_key) return;

    const on_keydown = (e: KeyboardEvent) => {
      e.stopImmediatePropagation();
      e.preventDefault();
      e.stopPropagation();
      const key = e.key?.toLocaleLowerCase();
      if (key && key !== 'escape') {
        ref_player_info.current?.set_key(editing_key, e.key.toLowerCase()).save();
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
      <span> 玩家{which}:{" "}
        <Input
          type='text'
          maxLength={50}
          style={{ width: 75 }}
          placeholder='enter player name'
          value={player_name}
          onChange={on_name_edit}
          onBlur={on_name_blur} />
      </span>
      <span>角色:</span>
      <CharacterSelect lf2={lf2} value={character_id} on_changed={set_character_id} />
      <span>队伍:</span>
      <TeamSelect value={team} on_changed={set_team} />
      <Button onClick={() => set_added(v => !v)}>{added ? '移除' : '加入'}</Button>
      <span style={{ display: !added ? 'none' : void 0 }}>hp:<span ref={hp_ref} /></span>
      <Button onClick={() => set_key_settings_show(v => !v)}>键位</Button>
      {!key_settings_show ? null :
        key_name_arr.map(k => {
          const on_click = () => set_editing_key(v => v === k ? void 0 : k);
          const name = key_names[k]
          const value = editing_key === k ? '编辑中...' : keys[k]
          return <Button key={k} onClick={on_click}>{name}: {value.toUpperCase()}</Button>
        })
      }
    </div >
  );
}
