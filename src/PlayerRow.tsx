import { useEffect, useState } from 'react';
import { Button } from './Component/Button';
import CharacterSelect from './Component/CharacterSelect';
import { Input } from './Component/Input';
import Select from './Component/Select';
import TeamSelect from './Component/TeamSelect';
import Titled from './Component/Titled';
import { ToggleButton } from './Component/ToggleButton';
import { DummyEnum } from './LF2/controller/BotController';
import { Defines } from './LF2/defines/defines';
import GameKey from './LF2/defines/GameKey';
import { is_bot_ctrl, is_local_ctrl } from './LF2/entity/type_check';
import LF2 from './LF2/LF2';
import { PlayerInfo } from './LF2/PlayerInfo';
import { random_get } from './LF2/utils/math/random';
import Combine from './Component/Combine';
import { Factory } from './LF2/entity/Factory';
import { new_id } from './LF2/base';
import LocalController from './LF2/controller/LocalController';

const key_names: Record<GameKey, string> = {
  U: '上',
  D: '下',
  L: '左',
  R: '右',
  a: '攻',
  j: '跳',
  d: '防'
}
const key_name_arr = Object.keys(key_names) as GameKey[];
interface Props {
  lf2: LF2;
  visible?: boolean;
  info: PlayerInfo;
  touch_pad_on?: boolean;
  on_click_toggle_touch_pad?(): void;
}
export function PlayerRow(props: Props) {
  const {
    lf2,
    info,
    visible = true,
    touch_pad_on,
    on_click_toggle_touch_pad
  } = props;

  const [keys, set_keys] = useState<Record<GameKey, string>>(info.keys);
  const [player_name, set_player_name] = useState<string>(info.name);
  const [editing_key, set_editing_key] = useState<GameKey | undefined>();

  const [team, set_team] = useState<string>(info.team);
  const [show_hidden, set_show_hidden] = useState<boolean>(false)
  const [character_id, set_character_id] = useState<string>(info.character);
  const [added, set_added] = useState(!!lf2.get_player_character(info.id));
  const [key_settings_show, set_key_settings_show] = useState(false);

  useEffect(() => {
    set_show_hidden(lf2.is_cheat_enabled('' + Defines.Cheats.LF2_NET))
    return lf2.callbacks.add({
      on_cheat_changed: (name, enabled) => {
        if (name === '' + Defines.Cheats.LF2_NET) set_show_hidden(enabled)
      }
    });
  }, [lf2]);

  useEffect(() => {
    set_keys(info.keys);
    set_player_name(info.name);
    return info.callbacks.add({
      on_key_changed: (name, key) => {
        set_keys(v => {
          const ks = { ...v, [name]: key };
          const character = lf2.get_player_character(info.id);
          if (character && is_local_ctrl(character.controller))
            character.controller.set_key_code_map(ks);
          return ks;
        })
      },
      on_name_changed: (name) => {
        set_player_name(name);
        const character = lf2.get_player_character(info.id);
        if (character) character.name = name;
      },
      on_team_changed: (team) => {
        set_team(team);
        const character = lf2.get_player_character(info.id);
        if (character) character.team = team;
      },
      on_character_changed: set_character_id,
    });
  }, [info, lf2]);

  useEffect(() => {
    if (!editing_key) return;
    const on_keydown = (e: KeyboardEvent) => {
      e.stopImmediatePropagation();
      e.preventDefault();
      e.stopPropagation();
      const key = e.key?.toLocaleLowerCase();
      if (key && key !== 'escape') {
        info.set_key(editing_key, e.key.toLowerCase()).save();
      }
      set_editing_key(void 0);
    }
    window.addEventListener('keydown', on_keydown, true);
    return () => window.removeEventListener('keydown', on_keydown, true);
  }, [editing_key, info])


  if (!lf2 || visible === false) return null;

  const on_click_add = added ? () => {
    lf2.del_player_character(info.id); // 移除玩家对应的角色
  } : () => {
    const real_character_id = character_id || random_get(lf2.datas.characters)?.id;
    if (!real_character_id) { debugger; return; }
    const character = lf2.add_player_character(info.id, real_character_id);
    if (!character) { debugger; return; }

    set_added(true);
    character.callbacks.add({
      on_disposed: () => set_added(false),
      on_team_changed: (_, team) => set_team('' + team)
    });
  }

  return (
    <div className='settings_row'>
      <span className='settings_row_title'>玩家</span>
      <Input
        type='text'
        maxLength={50}
        style={{ width: 50 }}
        title='enter player name'
        value={player_name}
        onChange={e => info.set_name(e.target.value)}
        onBlur={e => info.set_name(e.target.value.trim() || info.id).save()} />
      <CharacterSelect
        lf2={lf2}
        value={character_id}
        on_changed={v => info.set_character(v).save()}
        show_all={show_hidden} />
      <TeamSelect value={team} on_changed={v => info.set_team(v).save()} />
      <Button onClick={on_click_add}>{added ? '移除' : '加入'}</Button>
      <ToggleButton
        value={touch_pad_on}
        onClick={on_click_toggle_touch_pad}>
        <>触摸板</>
        <>触摸板✓</>
      </ToggleButton>
      <Combine>
        <Button onClick={() => set_key_settings_show(v => !v)}>键位</Button>
        {!key_settings_show ? null :
          key_name_arr.map(k => {
            const on_click = () => set_editing_key(v => v === k ? void 0 : k);
            const name = key_names[k]
            const value = editing_key === k ? '编辑中...' : keys[k]
            return (
              <Button key={k} onClick={on_click}>
                {name}: {
                  {
                    "ARROWUP": "↑",
                    "ARROWDOWN": "↓",
                    "ARROWLEFT": "←",
                    "ARROWRIGHT": "→",
                    "DELETE": "DEL",
                    "PAGEDOWN": "P↓",
                    "PAGEUP": "P↑",
                  }[value.toUpperCase()] || value.toUpperCase()
                }
              </Button>
            )
          })
        }
      </Combine>
      <Combine>
        <Button onClick={() => {
          const character = lf2.player_characters.get(info.id)
          if (!character) return;
          const ctrl = character.controller
          if (is_bot_ctrl(ctrl)) {
            character.controller = new LocalController(info.id, character, info.keys)
          } else {
            const cls = Factory.inst.get_ctrl_creator(character.id);
            if (cls) character.controller = cls(info.id, character);
          }
          ctrl?.dispose()

        }}>
          <>Bot</>
        </Button>
        <Select
          items={['', ...Object.keys(DummyEnum)]}
          style={{ width: 100 }}
          option={(k) => [k && (DummyEnum as any)[k], k || 'not dummy']}
          onChange={(v) => {
            const ctrl = lf2.player_characters.get(info.id)?.controller;
            if (is_bot_ctrl(ctrl)) {
              ctrl.dummy = v.target.value ? v.target.value as any : void 0;
            }
          }}
        />
      </Combine>
    </div >
  );
}
