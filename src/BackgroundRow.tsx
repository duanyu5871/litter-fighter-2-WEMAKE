import { useEffect, useState } from 'react';
import LF2, { ILf2Callback } from './LF2/LF2';
import { BaseController } from './LF2/controller/BaseController';
import { BotEnemyChaser } from './LF2/controller/BotEnemyChaser';
import { InvalidController } from './LF2/controller/InvalidController';
import { Character } from './LF2/entity/Character';
import CharacterSelect from './Component/CharacterSelect';
import Select from './Component/Select';
import { Button } from './Component/Button';
import { Input } from './Component/Input';
import { Checkbox } from "./Component/Checkbox";
import TeamSelect from './Component/TeamSelect';
import { IStageInfo, IStagePhaseInfo } from './common/lf2_type';
import { Defines } from './common/lf2_type/defines';
import { IWorldCallbacks } from './LF2/World';
import { useImmer } from 'use-immer';
const bot_controllers: { [x in string]?: (e: Character) => BaseController } = {
  'OFF': (e: Character) => new InvalidController(e),
  'enemy chaser': (e: Character) => new BotEnemyChaser(e)
}

export function BackgroundRow(props: { lf2?: LF2; visible?: boolean }) {
  const { lf2, visible } = props;

  const _stage = lf2?.world.stage;
  const _stage_data = _stage?.data;


  const [value, set_value] = useImmer({
    bg_id: _stage_data?.bg ?? Defines.THE_VOID_BG.id,
    stage_id: _stage_data?.id ?? Defines.THE_VOID_STAGE.id,
    type: (_stage_data?.id === Defines.THE_VOID_STAGE.id ? 'bg' : 'stage') as 'bg' | 'stage'
  });
  const [bgm, set_bgm] = useState<string>(lf2?.sound_mgr.bgm() ?? '');
  const [stage_bgm, set_stage_bgm] = useState<boolean>(lf2?.bgm_enable ?? false);
  const [stage_phase_list, set_stage_phases] = useState<IStagePhaseInfo[]>(_stage_data?.phases ?? []);
  const [stage_phase_idx, set_stage_phase_idx] = useState<number>(_stage?.cur_phase ?? -1);

  useEffect(() => {
    set_bgm(lf2?.sound_mgr.bgm() ?? '')
    set_stage_bgm(lf2?.bgm_enable ?? false);
    set_stage_phases(lf2?.world.stage.data.phases ?? []);
    set_stage_phase_idx(lf2?.world.stage.cur_phase ?? -1);
  }, [lf2])

  const bgm_list = useBgmList(lf2);
  useEffect(() => {
    if (!lf2) return;
    lf2.set_bgm_enable(stage_bgm)
  }, [stage_bgm, lf2]);

  useEffect(() => {
    if (!lf2) return;
    if (!bgm) lf2.sound_mgr.stop_bgm()
    else lf2.sound_mgr.play_bgm(bgm)
  }, [bgm, lf2]);

  useEffect(() => {
    if (!lf2) return;
    const world_callbacks: IWorldCallbacks = {
      on_stage_change: (curr) => {
        set_value({
          stage_id: curr.data.id,
          bg_id: curr.bg.data.id,
          type: curr.data.id === Defines.THE_VOID_STAGE.id ? 'bg' : 'stage'
        })
        set_stage_phase_idx(0);
        set_stage_phases(curr.data.phases);
        curr.callbacks.add({
          on_phase_changed(stage, curr, prev) {
            set_stage_phase_idx(curr ? stage.data.phases.indexOf(curr) : -1)
          },
        })
      },
    }
    return lf2.world.callbacks.add(world_callbacks)
  }, [lf2, set_value]);


  const stage_list = useStageList(lf2);

  const { bg_id, stage_id, type } = value
  useEffect(() => {
    if (!lf2?.loaded) return;
    if (type === 'bg')
      lf2.change_bg(bg_id);
    else if (type === 'stage')
      lf2.change_stage(stage_id);

    if (bg_id !== Defines.THE_VOID_BG.id && type === 'bg')
      lf2.set_layout(void 0)
    else if (stage_id !== Defines.THE_VOID_STAGE.id && type === 'stage')
      lf2.set_layout(void 0)
    else
      lf2.set_layout('main_page')
  }, [lf2, bg_id, stage_id, type, stage_list]);

  const min_rwn = 1;
  const max_rwn = 100;
  const [rwn, set_rwn] = useState(10)

  const min_rcn = 1;
  const max_rcn = 100;
  const [rcn, set_rcn] = useState(10)

  const [weapon_id, set_weapon_id] = useState<string>('');
  const [c_id, set_character_id] = useState<string>('');
  const [team, set_team] = useState<string>('');
  const [bot_ctrl, set_bot_ctrl] = useState<string>('');

  if (!lf2 || visible === false) return <></>;

  const on_click_add_weapon = () => {
    (
      weapon_id ?
        lf2.add_weapon(weapon_id, rwn) :
        lf2.add_random_weapon(rwn)
    )
  }
  const on_click_add_bot = () => {
    (
      c_id ?
        lf2.add_character(c_id, rcn, Number(team)) :
        lf2.add_random_character(rcn, Number(team))
    ).forEach(e => {
      e.name = 'bot';
      const controller_creator = bot_controllers[bot_ctrl];
      if (controller_creator) e.controller = controller_creator(e);
    })
  }
  const phase_desc = stage_phase_list[stage_phase_idx]?.desc
  return (
    <>
      <div className='background_settings_row'>
        关卡:
        <Select
          value={value.stage_id}
          on_changed={(v: string) => set_value(draft => {
            draft.type = 'stage'
            draft.stage_id = v;
          })}
          items={stage_list}
          option={i => [i.id, i.name]} />
        音乐:
        <Checkbox value={stage_bgm} onChanged={set_stage_bgm} />
        <Button onClick={() => lf2.world.stage.kill_all_enemies()}>杀死全部敌人</Button>
        <Button onClick={() => lf2.world.stage.kill_boss()}>杀死Boss</Button>
        <Button onClick={() => lf2.world.stage.kill_soliders()}>杀死士兵</Button>
        <Button onClick={() => lf2.world.stage.kill_others()}>杀死其他</Button>
        {
          !stage_phase_list.length ? null : <>
            phases:
            <Select on_changed={set_stage_phase_idx} value={stage_phase_idx} items={stage_phase_list} option={(i, idx) => [idx, [`No.${1 + idx}, bound: ${i.bound}`].filter(v => v).join(' ')]} />
          </>
        }
        {phase_desc ? `# ${phase_desc}` : void 0}
      </div>

      <div className='background_settings_row'>
        背景:
        <Select
          value={value.bg_id}
          on_changed={(v: string) => set_value(draft => {
            draft.type = 'bg'
            draft.bg_id = v;
          })}
          items={lf2.dat_mgr.backgrounds}
          option={i => [i.id, i.base.name]} />
        <Button onClick={v => lf2.remove_all_entities()}>清场</Button>
        BGM:
        <Select
          value={bgm}
          on_changed={set_bgm}
          items={bgm_list}
          option={i => [i, i || 'OFF']} />
        难度:
        <Select
          value={bgm}
          on_changed={set_bgm}
          items={bgm_list}
          option={i => [i, i || 'OFF']} />
      </div>

      <div className='background_settings_row'>
        武器:
        <Input type='number' style={{ width: 40 }}
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
        <Button onClick={on_click_add_weapon}>添加</Button>
      </div>

      <div className='background_settings_row'>
        BOT:
        <Input type='number' style={{ width: 40 }}
          min={min_rcn} max={max_rcn} step={1} value={rcn}
          onChange={e => set_rcn(Number(e.target.value))}
          onBlur={() => set_rcn(v => Math.min(Math.max(Math.floor(v), min_rcn), max_rcn))} />
        角色:
        <CharacterSelect lf2={lf2} value={c_id} on_changed={set_character_id} />
        队伍:
        <TeamSelect value={team} on_changed={set_team} />
        AI:
        <Select value={bot_ctrl}
          on_changed={set_bot_ctrl}
          items={Object.keys(bot_controllers)}
          option={i => [i, i]}
        />
        <Button onClick={on_click_add_bot}>添加</Button>
      </div>
    </>
  );
}

const empty_bgm_list = [''];
function useBgmList(lf2?: LF2 | null): string[] {
  const [bgm_list, set_bgm_list] = useState<string[]>(empty_bgm_list);
  useEffect(() => {
    if (!lf2) return;
    lf2.bgms.need_load && lf2.bgms.load();
    lf2.bgms.need_load || set_bgm_list(['', ...lf2.bgms.data ?? []]);
    const lf2_callbacks: ILf2Callback = {
      on_bgms_loaded: (names) => set_bgm_list(['', ...names]),
      on_bgms_clear: () => set_bgm_list(empty_bgm_list)
    };
    return lf2.callbacks.add(lf2_callbacks);
  }, [lf2]);
  return bgm_list
}

const empty_stage_list = [Defines.THE_VOID_STAGE];
function useStageList(lf2?: LF2 | null): IStageInfo[] {
  const [stage_list, set_stage_list] = useState<IStageInfo[]>(empty_stage_list);
  useEffect(() => {
    if (!lf2) return;
    lf2.stages.need_load && lf2.stages.load();
    lf2.stages.need_load || set_stage_list(lf2.stages.data ?? empty_stage_list)
    const lf2_callbacks: ILf2Callback = {
      on_stages_loaded: (stages) => set_stage_list(stages),
      on_stages_clear: () => set_stage_list(empty_stage_list)
    }
    return lf2.callbacks.add(lf2_callbacks);
  }, [lf2])
  return stage_list
}
