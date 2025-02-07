import { useEffect, useState } from "react";
import { Button } from "./Component/Buttons/Button";
import CharacterSelect from "./Component/CharacterSelect";
import Combine from "./Component/Combine";
import { Cross } from "./Component/Icons/Cross";
import { InputNumber, InputRef } from "./Component/Input";
import Select from "./Component/Select";
import Show from "./Component/Show";
import TeamSelect from "./Component/TeamSelect";
import Titled from "./Component/Titled";
import { ILf2Callback } from "./LF2/ILf2Callback";
import LF2 from "./LF2/LF2";
import { BaseController } from "./LF2/controller/BaseController";
import { BotController } from "./LF2/controller/BotController";
import { InvalidController } from "./LF2/controller/InvalidController";
import { IStageInfo } from "./LF2/defines/IStageInfo";
import { IStagePhaseInfo } from "./LF2/defines/IStagePhaseInfo";
import { Defines } from "./LF2/defines/defines";
import Entity from "./LF2/entity/Entity";
import Stage from "./LF2/stage/Stage";
import list_writable_properties, { TProperty } from "./LF2/utils/list_writable_properties";
import { is_num, is_str } from "./LF2/utils/type_check";
import { useLocalNumber, useLocalString } from "./useLocalStorage";
const bot_controllers: { [x in string]?: (e: Entity) => BaseController } = {
  OFF: (e: Entity) => new InvalidController("", e),
  "enemy chaser": (e: Entity) => new BotController("", e),
};

export interface ISettingsRowsProps {
  lf2?: LF2;
  visible?: boolean;
  show_stage_settings?: boolean;
  show_bg_settings?: boolean;
  show_weapon_settings?: boolean;
  show_bot_settings?: boolean;
  show_world_tuning?: boolean;
}

export default function SettingsRows(props: ISettingsRowsProps) {
  const { lf2, visible = true } = props;
  const _stage = lf2?.world.stage;
  const _stage_data = _stage?.data;

  const [stage_list, set_stage_list] = useState<IStageInfo[]>();
  const [bg_id, set_bg_id] = useState(Defines.VOID_BG.id);
  const [stage_id, set_stage_id] = useState(Defines.VOID_STAGE.id);

  const [bgm, set_bgm] = useState<string>(lf2?.sounds.bgm() ?? "");
  const [stage_phase_list, set_stage_phases] = useState<IStagePhaseInfo[]>(
    _stage_data?.phases ?? [],
  );
  const [stage_phase_idx, set_stage_phase_idx] = useState<number>(
    _stage?.cur_phase ?? -1,
  );
  const [difficulty, set_difficulty] = useState<Defines.Difficulty>(
    lf2?.difficulty ?? Defines.Difficulty.Difficult,
  );
  const [world_properties, set_world_properties] = useState<TProperty[]>();
  useEffect(() => {
    set_bgm(lf2?.sounds.bgm() ?? "");
    set_difficulty(lf2?.difficulty ?? Defines.Difficulty.Difficult);
    set_stage_list(lf2?.stages);
    const on_stage_change = (stage: Stage | undefined) => {
      set_stage_id(stage?.data.id ?? Defines.VOID_STAGE.id);
      set_bg_id(stage?.bg.data.id ?? Defines.VOID_BG.id);
      set_stage_phases(stage?.data.phases ?? []);
      set_stage_phase_idx(stage?.cur_phase ?? -1);
      stage?.callbacks.add({
        on_phase_changed(stage, curr) {
          set_stage_phase_idx(curr ? stage.data.phases.indexOf(curr) : -1);
        },
      });
    };
    on_stage_change(lf2?.world.stage);

    if (!lf2) return;
    const a = [
      lf2.callbacks.add({
        on_difficulty_changed: set_difficulty,
        on_loading_end: () => set_stage_list(lf2.stages),
      }),
      lf2.world.callbacks.add({ on_stage_change }),
    ];
    set_world_properties(list_writable_properties(lf2.world));
    return () => a.forEach((b) => b());
  }, [lf2]);

  useEffect(() => {
    if (!lf2) return;
    if (!bgm) lf2.sounds.stop_bgm();
    else lf2.sounds.play_bgm(bgm);
  }, [bgm, lf2]);

  const min_rwn = 1;
  const max_rwn = 100;
  const [rwn, set_rwn] = useLocalNumber<number>("debug_rwn", 10);

  const min_rcn = 1;
  const max_rcn = 100;
  const [rcn, set_rcn] = useLocalNumber<number>("debug_rcn", 10);

  const [weapon_id, set_weapon_id] = useState<string>("");
  const [c_id, set_character_id] = useState<string>("");
  const [team, set_team] = useLocalString<string>("debug_bot_team", "");
  const [bot_ctrl, set_bot_ctrl] = useLocalString<string>("debug_bot_ctrl", "");

  if (!lf2 || visible === false) return <></>;

  const on_click_add_weapon = () => {
    weapon_id ? lf2.add_weapon(weapon_id, rwn) : lf2.add_random_weapon(rwn);
  };
  const on_click_add_bot = () => {
    (c_id
      ? lf2.add_character(c_id, rcn, team)
      : lf2.add_random_character(rcn, team)
    ).forEach((e) => {
      e.name = "bot";
      const controller_creator = bot_controllers[bot_ctrl];
      if (controller_creator) e.ctrl = controller_creator(e);
    });
  };
  const phase_desc = stage_phase_list[stage_phase_idx]?.desc;

  return (
    <>
      <Show.Div
        className="settings_row"
        show={props.show_stage_settings !== false}
      >
        <Titled float_label="关卡">
          <Combine>
            <Select
              value={stage_id}
              on_changed={v => lf2.change_stage(v!)}
              items={stage_list}
              parse={(i) => [i.id, i.name]}
            />
            {!stage_phase_list.length ? null : (
              <Select
                title={phase_desc}
                on_changed={v => set_stage_phase_idx(v!)}
                value={stage_phase_idx}
                items={stage_phase_list}
                parse={(i, idx) => [
                  idx,
                  [`No.${1 + idx}, bound: ${i.bound}`].filter(Boolean).join(" "),
                ]}
              />
            )}
          </Combine>
        </Titled>
        <Combine>
          <Button onClick={() => lf2.world.stage.kill_all_enemies()}>
            杀死全部敌人
          </Button>
          <Button onClick={() => lf2.world.stage.kill_boss()}>杀死Boss</Button>
          <Button onClick={() => lf2.world.stage.kill_soliders()}>
            杀死士兵
          </Button>
          <Button onClick={() => lf2.world.stage.kill_others()}>杀死其他</Button>
        </Combine>
      </Show.Div>

      <Show.Div className="settings_row" show={props.show_bg_settings !== false}>
        <Titled float_label="背景">
          <Select
            value={bg_id}
            on_changed={v => lf2.change_bg(v!)}
            items={lf2.datas.backgrounds}
            parse={(i) => [i.id, i.base.name]}
          />
        </Titled>
        <Titled float_label="难度">
          <Select
            value={difficulty}
            on_changed={v => set_difficulty(v!)}
            items={[
              Defines.Difficulty.Easy,
              Defines.Difficulty.Normal,
              Defines.Difficulty.Difficult,
              Defines.Difficulty.Crazy,
            ]}
            parse={(i) => [i, Defines.DifficultyLabels[i]]}
          />
        </Titled>
        <Button onClick={(v) => lf2.remove_all_entities()}>清场</Button>
      </Show.Div>

      <Show.Div
        className="settings_row"
        show={props.show_weapon_settings !== false}
      >

        <Titled float_label="添加武器">
          <Combine>
            <InputNumber
              placeholder="数量"
              prefix="数量"
              min={min_rwn}
              max={max_rwn}
              step={1}
              value={rwn}
              onChange={(e) => set_rwn(Number(e.target.value))}
              onBlur={() =>
                set_rwn((v) =>
                  Math.min(Math.max(Math.floor(v), min_rwn), max_rwn),
                )
              }
            />
            <Select
              value={weapon_id}
              on_changed={v => set_weapon_id(v!)}
              items={[0, ...lf2.datas.weapons]}
              parse={i => is_num(i) ? ["", "Random"] : [i.id, i.base.name]} >
            </Select>
            <Button onClick={on_click_add_weapon}>
              添加
            </Button>
          </Combine>
        </Titled>
      </Show.Div>

      <Show.Div
        className="settings_row"
        show={props.show_bot_settings !== false}
      >
        <Titled float_label="添加BOT">
          <Combine>
            <InputNumber
              prefix="数量"
              min={min_rcn}
              max={max_rcn}
              step={1}
              value={rcn}
              onChange={(e) => set_rcn(Number(e.target.value))}
              onBlur={() =>
                set_rcn((v) =>
                  Math.min(Math.max(Math.floor(v), min_rcn), max_rcn),
                )
              }
            />
            <CharacterSelect
              lf2={lf2} value={c_id} on_changed={v => set_character_id(v!)} />
            <TeamSelect value={team} on_changed={v => set_team(v!)} />
            <Select
              value={bot_ctrl}
              on_changed={v => set_bot_ctrl(v!)}
              items={Object.keys(bot_controllers)}
              parse={(i) => [i, i]}
            />
            <Button onClick={on_click_add_bot}>添加</Button>
          </Combine>
        </Titled>
      </Show.Div >

      <Show.Div
        className="settings_row"
        show={props.show_world_tuning !== false}
      >
        {world_properties?.map((v, idx) => {
          let ref: InputRef | null = null;
          const rec = world_tuning_title_map[v.name]
          const r = Array.isArray(rec) ? rec : is_str(rec) ? [rec] as const : [v.name] as const;
          const [title, desc = title] = r
          return (
            <Titled
              float_label={title}
              title={desc}
              key={v.name + "_" + idx}>
              <Combine>
                <InputNumber
                  precision={2}
                  ref={(r) => (ref = r)}
                  placeholder={v.name}
                  step={0.01}
                  defaultValue={v.value}
                  onChange={(e) =>
                    ((lf2.world as any)[v.name] = Number(e.target.value))
                  } />
                <Button
                  title="重置"
                  onClick={(_) => {
                    (lf2.world as any)[v.name] = Number(v.value);
                    ref!.value = "" + v.value;
                  }}>
                  <Cross />
                </Button>
              </Combine>
            </Titled>
          );
        })}
      </Show.Div>
    </>
  );
}

const world_tuning_title_map: { [name in string]?: string | readonly [string] | readonly [string, string] } = {
  gravity: "重力",
  begin_blink_time: "入场闪烁时长",
  gone_blink_time: "消失闪烁时长",
  lying_blink_time: "起身闪烁时长",
  double_click_interval: "双击判定时长",
  key_hit_duration: "按键判定时长",
  itr_shaking: "受伤摇晃时长",
  itr_motionless: "命中停顿时长",
}