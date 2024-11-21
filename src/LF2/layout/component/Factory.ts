import { Warn } from "../../../Log";
import { is_str } from "../../utils/type_check";
import { ILayoutInfo } from "../ILayoutInfo";
import type Layout from "../Layout";
import { read_call_func_expression } from "../utils/read_func_args";
import BackgroundNameText from "./BackgroundNameText";
import CharacterSelLogic from "./CharacterSelLogic";
import ComNumButton from "./ComNumButton";
import DifficultyText from "./DifficultyText";
import GamePrepareLogic from "./GamePrepareLogic";
import LaunchPageLogic from "./LaunchPageLogic";
import { LayoutComponent } from "./LayoutComponent";
import LoadingFileNameDisplayer from "./LoadingFileNameDisplayer";
import OpacityHover from "./OpacityHover";
import PlayerCharacterHead from './PlayerCharacterHead';
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
import StageNameText from "./StageNameText";
import StageTitleShow from "./StageTitleShow";
import StageTransitions from "./StageTransitions";
import VerticalLayout from "./VerticalLayout";
import VsModeLogic from "./VsModeLogic";

class Factory {
  private _component_map = new Map<string, typeof LayoutComponent>([
    ['game_loading_file_name', LoadingFileNameDisplayer],
    ['key_set', PlayerKeyEditor],
    ['key_txt', PlayerKeyText],
    ['stage_transitions', StageTransitions],
    ['player_c_sel_logic', CharacterSelLogic],
    ['player_c_head', PlayerCharacterHead],
    ['player_c_thumb', PlayerCharacterThumb],
    ['player_c_name', PlayerCharacterName],
    ['player_name', PlayerName],
    ['player_t_name', PlayerTeamName],
    ['game_prepare_logic', GamePrepareLogic],
    ['com_number', ComNumButton],
    ['stage_title_show', StageTitleShow],
    ['reachable_layout_group', ReachableLayoutGroup],
    ['reachable_layout', ReachableLayout],
    ['launch_page', LaunchPageLogic],
    ['difficulty_text', DifficultyText],
    ['stage_name_text', StageNameText],
    ['background_name_text', BackgroundNameText],
    ['opacity_hover', OpacityHover],
    ['vertical_layout', VerticalLayout],
    ['player_score', PlayerScore],
    ['player_score_cell', PlayerScoreCell],
    ['vs_mode_logic', VsModeLogic],
    ['playing_time', PlayingTimeText],
    ['random_img_on_layout_resume', RandomImgOnLayoutResume]
  ])
  create(layout: Layout, components: ILayoutInfo['component']): LayoutComponent[] {
    if (!components?.length) return [];
    if (is_str(components)) components = [components]
    const ret: LayoutComponent[] = [];
    for (const component_expression of components) {
      const [func_name, args] = read_call_func_expression(component_expression);
      if (!func_name) {
        Warn.print(
          'Layout Component Factory',
          'expression not correct! expression:',
          component_expression
        )
        continue;
      }
      const Cls = this._component_map.get(func_name);
      if (!Cls) {
        Warn.print(
          'Layout Component Factory',
          'Component class not found! expression:',
          component_expression
        )
        continue;
      }

      const component = new Cls(layout, func_name).init(...args);
      ret.push(component);
    }
    return ret
  }
  register(key: string, Cls: typeof LayoutComponent) {
    this._component_map.set(key, Cls);
  }
}
const factory = new Factory();
export default factory