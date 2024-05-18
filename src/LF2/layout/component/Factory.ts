import { is_str } from "../../utils/type_check";
import { ILayoutInfo } from "../ILayoutInfo";
import type Layout from "../Layout";
import { read_call_func_expression } from "../utils/read_func_args";
import { LayoutComponent } from "./LayoutComponent";
import LoadingFileNameDisplayer from "./LoadingFileNameDisplayer";
import PlayerCharacterHead from './PlayerCharacterHead';
import PlayerCharacterName from "./PlayerCharacterName";
import CharacterSelLogic from "./CharacterSelLogic";
import PlayerKeyEditor from "./PlayerKeyEditor";
import PlayerName from "./PlayerName";
import PlayerTeamName from "./PlayerTeamName";
import StageTransitions from "./StageTransitions";
import GamePrepareLogic from "./GamePrepareLogic";
import ComNumButton from "./ComNumButton";
import StageTitleShow from "./StageTitleShow";
import { ReachableLayoutGroup, ReachableLayout } from "./ReachableLayoutGroup";
import LaunchPageLogic from "./LaunchPageLogic";
import DifficultyText from "./DifficultyText";
class Factory {
  private _component_map = new Map<string, typeof LayoutComponent>([
    ['game_loading_file_name', LoadingFileNameDisplayer],
    ['key_set', PlayerKeyEditor],
    ['stage_transitions', StageTransitions],
    ['player_c_sel_logic', CharacterSelLogic],
    ['player_c_head', PlayerCharacterHead],
    ['player_c_name', PlayerCharacterName],
    ['player_name', PlayerName],
    ['player_t_name', PlayerTeamName],
    ['game_prepare_logic', GamePrepareLogic],
    ['com_number', ComNumButton],
    ['stage_title_show', StageTitleShow],
    ['reachable_layout_group', ReachableLayoutGroup],
    ['reachable_layout', ReachableLayout],
    ['launch_page', LaunchPageLogic],
    ['difficulty_text', DifficultyText]
  ])
  create(layout: Layout, components: ILayoutInfo['component']): LayoutComponent[] {
    if (!components?.length) return [];
    if (is_str(components)) components = [components]
    const ret: LayoutComponent[] = [];
    for (const text of components) {
      const [func_name, args] = read_call_func_expression(text);
      if (!func_name) continue;

      const Cls = this._component_map.get(func_name);
      if (!Cls) continue;

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