import { useEffect, useState } from 'react';
import LF2 from './LF2/LF2';
import { IController } from './LF2/controller/IController';
import { SimpleFollowController } from './LF2/controller/SimpleFollowController';
import { Character } from './LF2/entity/Character';
import { Entity } from './LF2/entity/Entity';
import CharacterSelect from './LF2/ui/CharacterSelect';
import Select from './LF2/ui/Select';
import TeamSelect from './LF2/ui/TeamSelect';
import { IStageInfo, IStagePhaseInfo } from './js_utils/lf2_type';
import { Defines } from './js_utils/lf2_type/defines';

const bot_controllers: { [x in string]?: (e: Character) => IController<Character> } = {
  'SimpleFollow': (e: Character) => new SimpleFollowController(e)
}

export function BlackgroundRow(props: { lf2?: LF2; visible?: boolean }) {
  const { lf2, visible } = props;
  const [bg, set_bg] = useState<string>();
  const [bgm, set_bgm] = useState<string>('');
  const [bgm_list, set_bgm_list] = useState<string[]>([]);
  const [stage_id, set_stage_id] = useState<string>('');
  const [stage_bgm, set_stage_bgm] = useState<boolean>(false);
  const [stage_list, set_stage_list] = useState<IStageInfo[]>([]);
  const [stage_phase_list, set_stage_phases] = useState<IStagePhaseInfo[]>([]);
  const [stage_phase_idx, set_stage_phase_idx] = useState<number>(-1);

  useEffect(() => {
    if (!lf2) return;
    lf2.set_stage_bgm_enable(stage_bgm)
  }, [stage_bgm, lf2]);

  useEffect(() => {
    if (!lf2) return;
    if (!bgm) lf2.sound_mgr.stop_bgm()
    else lf2.sound_mgr.play_bgm(bgm)
  }, [bgm, lf2]);

  useEffect(() => {
    if (!lf2) return;
    if (!bgm) lf2.sound_mgr.stop_bgm()
    else lf2.sound_mgr.play_bgm(bgm)
  }, [bgm, lf2]);

  useEffect(() => {
    if (!lf2) return;
    lf2.bgms().then(v => set_bgm_list(['', ...v]));

    set_stage_list([Defines.THE_VOID_STAGE, ...lf2.stage_infos])
    lf2.world.callbacks.add({
      on_stage_change: (_world, curr, _prev) => {
        set_stage_id(curr.data.id)
        set_stage_phase_idx(0);
        set_stage_phases(curr.data.phases);
        curr.callbacks.add({
          on_phase_changed(stage, curr, prev) {
            set_stage_phase_idx(curr ? stage.data.phases.indexOf(curr) : -1)
          },
        })
      },
    })
  }, [lf2]);

  useEffect(() => {
    if (!lf2) return;
    if (bg) lf2.change_bg(bg);
    else lf2.remove_bg();
  }, [lf2, bg]);

  useEffect(() => {
    if (!lf2) return;
    const data = stage_list.find(v => v.id === stage_id);
    if (data) lf2.change_stage(data);
    else lf2.remove_stage();
  }, [lf2, stage_id, stage_list]);


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
  const phase_desc = stage_phase_list[stage_phase_idx]?.desc
  return (
    <>
      <div className='background_settings_row'>
        stage:
        <Select on_changed={set_stage_id} value={stage_id} items={stage_list} option={i => [i.id, i.name]} />
        bgm:
        <input type='checkbox' checked={stage_bgm} onChange={e => set_stage_bgm(e.target.checked)} />
        <button onClick={() => lf2.world.stage.kill_all_enemies()}>kill enemies</button>
        <button onClick={() => lf2.world.stage.kill_boss()}>kill boss</button>
        <button onClick={() => lf2.world.stage.kill_soliders()}>kill soliders</button>
        <button onClick={() => lf2.world.stage.kill_others()}>kill others</button>
        {
          !stage_phase_list.length ? null : <>
            phases:
            <Select on_changed={set_stage_phase_idx} value={stage_phase_idx} items={stage_phase_list} option={(i, idx) => [idx, [`No.${1 + idx}, bound: ${i.bound}`].filter(v => v).join(' ')]} />
          </>
        }
        {phase_desc ? `# ${phase_desc}` : void 0}
      </div>

      <div className='background_settings_row'>
        background:
        <Select
          value={bg}
          on_changed={set_bg}
          items={lf2.dat_mgr.backgrounds}
          option={i => [i.id, i.base.name]}>
          <option value=''>OFF</option>
        </Select>
        <button onClick={v => lf2.clear()}>clear</button>
        music:
        <Select
          value={bgm}
          on_changed={set_bgm}
          items={bgm_list}
          option={i => [i, i || 'OFF']} />
      </div>

      <div className='background_settings_row'>
        weapon:
        <input type='number' style={{ width: 40 }}
          min={min_rwn} max={max_rwn} step={1} value={rwn}
          onChange={e => set_rwn(Number(e.target.value))}
          onBlur={() => set_rwn(v => Math.min(Math.max(Math.floor(v), min_rwn), max_rwn))} />
        <Select
          value={weapon_id}
          on_changed={set_weapon_id}
          items={lf2.dat_mgr.weapons}
          option={i => [i.id, i.base.name]}>
          <option value=''>Random</option>
        </Select>
        <button onClick={on_click_add_weapon}>add</button>
      </div>

      <div className='background_settings_row'>
        bot:
        <input type='number' style={{ width: 40 }}
          min={min_rcn} max={max_rcn} step={1} value={rcn}
          onChange={e => set_rcn(Number(e.target.value))}
          onBlur={() => set_rcn(v => Math.min(Math.max(Math.floor(v), min_rcn), max_rcn))} />
        character:
        <CharacterSelect lf2={lf2} value={c_id} on_changed={set_character_id} />
        team:
        <TeamSelect value={team} on_changed={set_team} />
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