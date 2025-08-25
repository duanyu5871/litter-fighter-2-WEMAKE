import Ditto from "../../ditto";
import { is_str } from "../../utils/type_check";
import { IUIInfo } from "../IUIInfo.dat";
import type { UINode } from "../UINode";
import { parse_call_func_expression } from "../utils/parse_call_func_expression";
import { Alignment } from "./Alignment";
import BackgroundNameText from "./BackgroundNameText";
import ComNumButton from "./ComNumButton";
import { DanmuGameLogic } from "./DanmuGameLogic";
import { DemoModeLogic } from "./DemoModeLogic";
import DifficultyText from "./DifficultyText";
import { FadeInOpacity } from "./FadeInOpacity";
import { FadeOutOpacity } from "./FadeOutOpacity";
import FighterHead from "./FighterHead";
import FighterName from "./FighterName";
import { FitChildren } from "./FitChildren";
import { Flex } from "./Flex";
import { FlexItem } from "./FlexItem";
import GamePrepareLogic from "./GamePrepareLogic";
import { HorizontalLayout } from "./HorizontalLayout";
import { IUICompnentCallbacks } from "./IUICompnentCallbacks";
import { ImgLoop } from "./ImgLoop";
import { Items } from "./Items";
import { Jalousie } from "./Jalousie";
import { LaunchPageLogic } from "./LaunchPageLogic";
import { LoadingContentText } from "./LoadingContentText";
import { OpacityAnimation } from "./OpacityAnimation";
import { OpacityHover } from "./OpacityHover";
import PlayerCharacterThumb from "./PlayerCharacterThumb";
import { PlayerCtrlType } from "./PlayerCtrlType";
import { PlayerKeyEdit } from "./PlayerKeyEdit";
import { PlayerKeyText } from "./PlayerKeyText";
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
import { Sounds } from "./Sounds";
import StageNameText from "./StageNameText";
import { StageTitleShow } from "./StageTitleShow";
import { StageTitleText } from "./StageTitleText";
import StageTransitions from "./StageTransitions";
import { UIComponent } from "./UIComponent";
import { VerticalLayout } from "./VerticalLayout";
import { VsModeLogic } from "./VsModeLogic";

class ComponentFactory {
  static readonly TAG = `ComponentFactory`;
  private _component_map = new Map<string, typeof UIComponent<IUICompnentCallbacks>>([
    [LoadingContentText.TAG, LoadingContentText],
    [PlayerKeyEdit.TAG, PlayerKeyEdit],
    [PlayerKeyText.TAG, PlayerKeyText],

    ["stage_transitions", StageTransitions],
    ["player_c_sel_logic", SlotSelLogic],
    [FighterHead.TAG, FighterHead],
    ["player_c_thumb", PlayerCharacterThumb],
    [FighterName.TAG, FighterName],
    [PlayerName.TAG, PlayerName],
    [PlayerTeamName.TAG, PlayerTeamName],
    [GamePrepareLogic.TAG, GamePrepareLogic],
    ["com_number", ComNumButton],
    [StageTitleShow.TAG, StageTitleShow],
    [ReachableGroup.TAG, ReachableGroup],
    [Reachable.TAG, Reachable],
    ["launch_page", LaunchPageLogic],
    [DifficultyText.TAG, DifficultyText],
    ["stage_name_text", StageNameText],
    [StageTitleText.TAG, StageTitleText],
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
    [Sounds.TAG, Sounds],
    [ImgLoop.TAG, ImgLoop],
    [PlayerCtrlType.TAG, PlayerCtrlType],
    [Alignment.TAG, Alignment],
    [Flex.TAG, Flex],
    [FlexItem.TAG, FlexItem],
    [FitChildren.TAG, FitChildren],
    [DanmuGameLogic.TAG, DanmuGameLogic],
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
      const { name, args = [], enabled = true, id = '', properties = {} } = info;
      const component = new cls(layout, name, { name, args, enabled, id, properties })
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
