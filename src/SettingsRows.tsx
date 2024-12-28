import { useEffect, useState } from "react";
import { Button } from "./Component/Button";
import CharacterSelect from "./Component/CharacterSelect";
import Combine from "./Component/Combine";
import { Input } from "./Component/Input";
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
  const [world_writable_properties, set_world_writable_properties] =
    useState<{ name: string; value: number }[]>();
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
    set_world_writable_properties(lf2.world.list_writable_properties());
    return () => a.forEach((b) => b());
  }, [lf2]);

  const bgm_list = useBgmList(lf2);

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
      if (controller_creator) e.controller = controller_creator(e);
    });
  };
  const phase_desc = stage_phase_list[stage_phase_idx]?.desc;

  return (
    <>
      <Show.Div
        className="settings_row"
        show={props.show_stage_settings !== false}
      >
        <div className="settings_row_title">切换关卡</div>
        <Titled title="关卡">
          <Select
            value={stage_id}
            on_changed={(id: string) => lf2.change_stage(id)}
            items={stage_list}
            option={(i) => [i.id, i.name]}
          />
        </Titled>
        <Button onClick={() => lf2.world.stage.kill_all_enemies()}>
          杀死全部敌人
        </Button>
        <Button onClick={() => lf2.world.stage.kill_boss()}>杀死Boss</Button>
        <Button onClick={() => lf2.world.stage.kill_soliders()}>
          杀死士兵
        </Button>
        <Button onClick={() => lf2.world.stage.kill_others()}>杀死其他</Button>
        {!stage_phase_list.length ? null : (
          <>
            phases:
            <Select
              on_changed={set_stage_phase_idx}
              value={stage_phase_idx}
              items={stage_phase_list}
              option={(i, idx) => [
                idx,
                [`No.${1 + idx}, bound: ${i.bound}`].filter((v) => v).join(" "),
              ]}
            />
          </>
        )}
        {phase_desc ? `# ${phase_desc}` : void 0}
      </Show.Div>

      <Show.Div
        className="settings_row"
        show={props.show_bg_settings !== false}
      >
        <div className="settings_row_title">切换背景</div>
        <Titled title="背景">
          <Select
            value={bg_id}
            on_changed={(bg_id: string) => lf2.change_bg(bg_id)}
            items={lf2.datas.backgrounds}
            option={(i) => [i.id, i.base.name]}
          />
        </Titled>
        <Titled title="BGM">
          <Select
            value={bgm}
            on_changed={set_bgm}
            items={bgm_list}
            option={(i) => [i, i || "OFF"]}
          />
        </Titled>
        <Titled title="难度">
          <Select
            value={difficulty}
            on_changed={set_difficulty}
            items={[
              Defines.Difficulty.Easy,
              Defines.Difficulty.Normal,
              Defines.Difficulty.Difficult,
              Defines.Difficulty.Crazy,
            ]}
            option={(i) => [i, Defines.DifficultyLabels[i]]}
          />
        </Titled>
        <Button onClick={(v) => lf2.remove_all_entities()}>清场</Button>
      </Show.Div>

      <Show.Div
        className="settings_row"
        show={props.show_weapon_settings !== false}
      >
        <div className="settings_row_title">添加武器</div>
        <Titled title="数量">
          <Input
            type="number"
            style={{ width: 40 }}
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
        </Titled>
        <Titled title="类型">
          <Select
            value={weapon_id}
            on_changed={set_weapon_id}
            items={lf2.datas.weapons}
            option={(i) => [i.id, i.base.name]}
          >
            <option value="">Random</option>
          </Select>
        </Titled>
        <Button onClick={on_click_add_weapon}>添加</Button>
      </Show.Div>

      <Show.Div
        className="settings_row"
        show={props.show_bot_settings !== false}
      >
        <div className="settings_row_title">添加BOT</div>

        <Titled title="数量">
          <Input
            type="number"
            style={{ width: 40 }}
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
        </Titled>

        <Titled title="角色">
          <CharacterSelect
            lf2={lf2}
            value={c_id}
            on_changed={set_character_id}
          />
        </Titled>

        <Titled title="队伍">
          <TeamSelect value={team} on_changed={set_team} />
        </Titled>

        <Titled title="AI">
          <Select
            value={bot_ctrl}
            on_changed={set_bot_ctrl}
            items={Object.keys(bot_controllers)}
            option={(i) => [i, i]}
          />
        </Titled>
        <Button onClick={on_click_add_bot}>添加</Button>
      </Show.Div>

      <Show.Div
        className="settings_row"
        show={props.show_world_tuning !== false}
      >
        {world_writable_properties?.map((v, idx) => {
          let ref: HTMLInputElement | null = null;
          return (
            <Titled title={v.name} key={v.name + "_" + idx}>
              <Combine>
                <Input
                  _ref={(r) => (ref = r)}
                  type="number"
                  style={{ width: 50 }}
                  step={0.01}
                  defaultValue={v.value}
                  onChange={(e) =>
                    ((lf2.world as any)[v.name] = Number(e.target.value))
                  }
                />
                <Button
                  onClick={(_) => {
                    (lf2.world as any)[v.name] = Number(v.value);
                    ref!.value = "" + v.value;
                  }}
                >
                  ×
                </Button>
              </Combine>
            </Titled>
          );
        })}
      </Show.Div>
    </>
  );
}

const empty_bgm_list = [""];
function useBgmList(lf2?: LF2 | null): string[] {
  const [bgm_list, set_bgm_list] = useState<string[]>(empty_bgm_list);
  useEffect(() => {
    if (!lf2) return;
    lf2.bgms.need_load && lf2.bgms.load();
    lf2.bgms.need_load || set_bgm_list(["", ...(lf2.bgms.data ?? [])]);
    const lf2_callbacks: ILf2Callback = {
      on_bgms_loaded: (names) => set_bgm_list(["", ...names]),
      on_bgms_clear: () => set_bgm_list(empty_bgm_list),
    };
    return lf2.callbacks.add(lf2_callbacks);
  }, [lf2]);
  return bgm_list;
}
