import { ILayoutInfo } from "../ILayoutInfo";
import type Layout from "../Layout";
import { read_func_args } from "../utils/read_func_args";
import type { LayoutComponent } from "./LayoutComponent";
import { LoadingFileNameDisplayer } from "./LoadingFileNameDisplayer";
import { PlayerKeyEditor } from "./PlayerKeyEditor";

class Factory {
  private _component_map = new Map<string, typeof LayoutComponent>([
    ['game_loading_file_name', LoadingFileNameDisplayer],
    ['key_set', PlayerKeyEditor]
  ])
  create_component(layout: Layout, component: ILayoutInfo['component']): LayoutComponent[] {
    // TODO: 支持多个component？
    if (!component) return [];
    for (const [key, Cls] of this._component_map) {
      const args = read_func_args(component, key);
      if (!args) continue;
      return [new Cls(layout).init(...args)]
    }
    return []
  }
}
const factory = new Factory();
export default factory