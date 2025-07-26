import Ditto from "../../ditto";
import { is_str } from "../../utils/type_check";
import { IUIInfo } from "../IUIInfo";
import type { UINode } from "../UINode";
import { parse_call_func_expression } from "../utils/parse_call_func_expression";
import BackgroundNameText from "./BackgroundNameText";
import ComNumButton from "./ComNumButton";
import { DemoModeLogic } from "./DemoModeLogic";
import DifficultyText from "./DifficultyText";
import { FadeInOpacity } from "./FadeInOpacity";
import { FadeOutOpacity } from "./FadeOutOpacity";
import FighterHead from "./FighterHead";
import FighterName from "./FighterName";
import GamePrepareLogic from "./GamePrepareLogic";
import { HorizontalLayout } from "./HorizontalLayout";
import { Items } from "./Items";
import { Jalousie } from "./Jalousie";
import LaunchPageLogic from "./LaunchPageLogic";
import LoadingFileNameDisplayer from "./LoadingFileNameDisplayer";
import { OpacityAnimation } from "./OpacityAnimation";
import OpacityHover from "./OpacityHover";
import PlayerCharacterThumb from "./PlayerCharacterThumb";
import PlayerKeyEditor from "./PlayerKeyEditor";
import PlayerKeyText from "./PlayerKeyText";
import PlayerName from "./PlayerName";
import PlayerScore from "./PlayerScore";
import PlayerScoreCell from "./PlayerScoreCell";
import PlayerTeamName from "./PlayerTeamName";
import { PlayingTimeText } from "./PlayingTimeText";
import { PositionAnimation } from "./PositionAnimation";
import { RandomImgOnLayoutResume } from "./RandomImgOnLayoutResume";
import { Reachable } from "./Reachable";
import { ReachableGroup } from "./ReachableGroup";
import { ScaleAnimation } from "./ScaleAnimation";
import { SineOpacity } from "./SineOpacity";
import SlotSelLogic from "./SlotSelLogic";
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
    ["player_c_sel_logic", SlotSelLogic],
    [FighterHead.TAG, FighterHead],
    ["player_c_thumb", PlayerCharacterThumb],
    [FighterName.TAG, FighterName],
    ["player_name", PlayerName],
    ["player_t_name", PlayerTeamName],
    [GamePrepareLogic.TAG, GamePrepareLogic],
    ["com_number", ComNumButton],
    ["stage_title_show", StageTitleShow],
    [ReachableGroup.TAG, ReachableGroup],
    [Reachable.TAG, Reachable],
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
    [SineOpacity.TAG, SineOpacity],
    [FadeInOpacity.TAG, FadeInOpacity],
    [FadeOutOpacity.TAG, FadeOutOpacity],
    [OpacityAnimation.TAG, OpacityAnimation],
    [ScaleAnimation.TAG, ScaleAnimation],
    [PositionAnimation.TAG, PositionAnimation],
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
    for (let idx = 0; idx < components.length; idx++) {
      const raw = components[idx];
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
      const { name, args = [], enabled = true, id = '' } = info;
      const component = new cls(layout, name)
      component.init(...args)
      component.set_enabled(enabled);
      component.id = id || `${name}_${idx}`
      ret.push(component);
    }
    return ret;
  }

}
const factory = new ComponentFactory();
export default factory;
