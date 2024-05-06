import { ILayoutInfo } from "../ILayoutInfo";
import type Layout from "../Layout";
import { read_func_args } from "../utils/read_func_args";
import type { LayoutComponent } from "./LayoutComponent";
import LoadingFileNameDisplayer from "./LoadingFileNameDisplayer";
import PlayerCharacterHead from './PlayerCharacterHead';
import PlayerKeyEditor from "./PlayerKeyEditor";
import StageTransitions from "./StageTransitions";
class Factory {
  private _component_map = new Map<string, typeof LayoutComponent>([
    ['game_loading_file_name', LoadingFileNameDisplayer],
    ['key_set', PlayerKeyEditor],
    ['stage_transitions', StageTransitions],
    ['player_c_head', PlayerCharacterHead]
  ])
  create_component(layout: Layout, component: ILayoutInfo['component']): LayoutComponent[] {
    // TODO: 支持多个component？
    if (!component) return [];
    for (const [key, Cls] of this._component_map) {
      const args = read_func_args(component, key);
      if (!args) continue;
      return [new Cls(layout, key).init(...args)]
    }
    return []
  }
}
const factory = new Factory();
export default factory