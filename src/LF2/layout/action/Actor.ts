import { is_str } from "../../utils/type_check";
import type Layout from "../Layout";
import { read_call_func_expression } from "../utils/read_func_args";

interface IActionHandler { (layout: Layout, ...args: string[]): void }
class Actor {
  private _handler_map = new Map<string, IActionHandler>([
    ['alert', (_, msg) => alert(msg)],
    ['link_to', (_, url) => window.open(url)],
    ['goto', ({ lf2 }, layout_id) => lf2.set_layout(layout_id)],
    ['push', ({ lf2 }, layout_id) => lf2.push_layout(layout_id)],
    ['loop_img', (l) => l.to_next_img()],
    ['load_default_data', ({ lf2 }) => lf2.loading || lf2.load()]
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