import Ditto from "../../ditto";
import { is_str } from "../../utils/type_check";
import { IUIInfo } from "../IUIInfo";
import type { UINode } from "../UINode";
import { parse_call_func_expression } from "../utils/parse_call_func_expression";
import BackgroundNameText from "./BackgroundNameText";
import CharacterSelLogic from "./CharacterSelLogic";
import ComNumButton from "./ComNumButton";
import { DemoModeLogic } from "./DemoModeLogic";
import DifficultyText from "./DifficultyText";
import { FadeInOpacity } from "./FadeInOpacity";
import { FadeOutOpacity } from "./FadeOutOpacity";
import GamePrepareLogic from "./GamePrepareLogic";
import { HorizontalLayout } from "./HorizontalLayout";
import { Items } from "./Items";
import { Jalousie } from "./Jalousie";
import LaunchPageLogic from "./LaunchPageLogic";
import LoadingFileNameDisplayer from "./LoadingFileNameDisplayer";
import { OpacityAnimation } from "./OpacityAnimation";
import OpacityHover from "./OpacityHover";
import PlayerCharacterHead from "./PlayerCharacterHead";
import PlayerCharacterName from "./PlayerCharacterName";
import PlayerCharacterThumb from "./PlayerCharacterThumb";
import PlayerKeyEditor from "./PlayerKeyEditor";
import PlayerKeyText from "./PlayerKeyText";
import PlayerName from "./PlayerName";
import PlayerScore from "./PlayerScore";
import PlayerScoreCell from "./PlayerScoreCell";
import PlayerTeamName from "./PlayerTeamName";
import { PlayingTimeText } from "./PlayingTimeText";
import { RandomImgOnLayoutResume } from "./RandomImgOnLayoutResume";
import { ReachableLayout, ReachableLayoutGroup } from "./ReachableLayoutGroup";
import { SineOpacity } from "./SineOpacity";
import StageNameText from "./StageNameText";
import StageTitleShow from "./StageTitleShow";
import StageTransitions from "./StageTransitions";
import { UIComponent } from "./UIComponent";
import VerticalLayout from "./VerticalLayout";
import VsModeLogic from "./VsModeLogic";

class ComponentFactory {
  static readonly TAG = `ComponentFactory`;
  private _component_map = new Map<string, typeof UIComponent>([
    ["game_loading_file_name", LoadingFileNameDisplayer],
    ["key_set", PlayerKeyEditor],
    ["key_txt", PlayerKeyText],
    ["stage_transitions", StageTransitions],
    ["player_c_sel_logic", CharacterSelLogic],
    ["player_c_head", PlayerCharacterHead],
    ["player_c_thumb", PlayerCharacterThumb],
    ["player_c_name", PlayerCharacterName],
    ["player_name", PlayerName],
    ["player_t_name", PlayerTeamName],
    ["game_prepare_logic", GamePrepareLogic],
    ["com_number", ComNumButton],
    ["stage_title_show", StageTitleShow],
    ["reachable_layout_group", ReachableLayoutGroup],
    ["reachable_layout", ReachableLayout],
    ["launch_page", LaunchPageLogic],
    ["difficulty_text", DifficultyText],
    ["stage_name_text", StageNameText],
    ["background_name_text", BackgroundNameText],
    ["opacity_hover", OpacityHover],
    ["vertical_layout", VerticalLayout],
    ["horizontal_layout", HorizontalLayout],
    ["player_score", PlayerScore],
    ["player_score_cell", PlayerScoreCell],
    ["vs_mode_logic", VsModeLogic],
    ["demo_mode_logic", DemoModeLogic],
    ["playing_time", PlayingTimeText],
    ["random_img_on_layout_resume", RandomImgOnLayoutResume],
    ["jalousie", Jalousie],
    ["items", Items],
    ["sine_opacity", SineOpacity],

    ["fade_in_opacity", FadeInOpacity],
    ["fade_out_opacity", FadeOutOpacity],
    [OpacityAnimation.TAG, OpacityAnimation],
  ]);

  register(key: string, Cls: typeof UIComponent) {
    if (this._component_map.has(key))
      Ditto.Warn(`[${ComponentFactory.TAG}::register] key already exists, ${key}`)
    this._component_map.set(key, Cls);
  }

  create(layout: UINode, components: IUIInfo["component"]): UIComponent[] {
    if (!components) return [];
    if (!Array.isArray(components)) components = [components]
    if (!components.length) return [];

    const ret: UIComponent[] = [];
    for (const raw of components) {
      const info = is_str(raw) ? parse_call_func_expression(raw) : raw
      if (!info) {
        Ditto.Warn(`[${ComponentFactory.TAG}::create] expression not correct! expression: ${raw}`);
        continue;
      }
      const cls = this._component_map.get(info.name);
      if (!cls) {
        Ditto.Warn(`[${ComponentFactory.TAG}::create] Component not found! expression: ${raw}`);
        continue;
      }
      const { name, args = [], enabled = true } = info;
      const component = new cls(layout, name).init(...args).set_enabled(enabled);
      ret.push(component);
    }
    return ret;
  }

}
const factory = new ComponentFactory();
export default factory;
