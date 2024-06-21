import { Warn } from "../../../Log";
import { is_str } from "../../utils/type_check";
import type Layout from "../Layout";
import { read_call_func_expression } from "../utils/read_func_args";

interface IActionHandler { (layout: Layout, ...args: string[]): void }
class Actor {
  private _handler_map = new Map<string, IActionHandler>([
    ['alert', (_, msg) => alert(msg)],
    ['link_to', (_, url) => window.open(url)],
    ['set_layout', ({ lf2 }, layout_id) => layout_id && lf2.set_layout(layout_id)],
    ['push_layout', ({ lf2 }, layout_id) => layout_id && lf2.push_layout(layout_id)],
    ['pop_layout', ({ lf2 }) => lf2.pop_layout()],
    ['loop_img', (l) => l.to_next_img()],
    ['load_data', ({ lf2 }, url) => {
      if (lf2.loading) return;
      lf2.load(url)
        .catch(e => Warn.print(`Actor.load_data, ${url} not exists`, e))
    }],
    ['broadcast', ({ lf2 }, message) => message && lf2.broadcast(message)],
    ['sound', ({ lf2 }, name) => name && lf2.sounds.play_preset(name)],
    ['switch_difficulty', ({ lf2 }) => lf2.switch_difficulty()],
    ['destory_stage', ({ lf2 }) => lf2.remove_stage()],
    ['remove_all_entities', ({ lf2 }) => lf2.remove_all_entities()],
    ['exit', () => { if (window.confirm('确定退出?')) window.close() }]
  ])
  act(layout: Layout, actions: string | string[]): void {
    if (!actions.length) return;
    if (is_str(actions)) actions = [actions];
    for (const action of actions) {
      const [func_name, args] = read_call_func_expression(action);
      if (!func_name) return
      const handler = this._handler_map.get(func_name);
      if (!handler) return;
      handler(layout, ...args);
    }
  }

  add(key: string, handler: IActionHandler): void {
    this._handler_map.set(key, handler);
  }
}
const actor = new Actor();
export default actor