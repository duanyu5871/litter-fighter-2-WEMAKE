import { Ditto } from "../../ditto";
import { is_str } from "../../utils/type_check";
import { TAction } from "../IUIInfo.dat";
import type { UINode } from "../UINode";
import { parse_call_func_expression } from "../utils/parse_call_func_expression";

interface IUIActionHandler {
  (layout: UINode, ...args: string[]): void;
}
class UIActor {
  static readonly TAG: string = "Actor";
  private _handler_map = new Map<string, IUIActionHandler>([
    ["alert", (_, msg) => alert(msg)],
    ["link_to", (_, url) => window.open(url)],
    [
      "set_layout",
      ({ lf2 }, layout_id) => layout_id && lf2.set_ui(layout_id),
    ],
    [
      "push_layout",
      ({ lf2 }, layout_id) => layout_id && lf2.push_ui(layout_id),
    ],
    ["pop_layout", ({ lf2 }) => lf2.pop_ui()],
    ["loop_img", (l) => l.to_next_img()],
    [
      "load_data",
      ({ lf2 }, url) => {
        if (lf2.loading) return;
        lf2.load(url).catch((e) => Ditto.warn(`[${UIActor.TAG}::load_data] ${url} not exists, err: ${e}`));
      },
    ],
    ["broadcast", ({ lf2 }, message) => message && lf2.broadcast(message)],
    ["sound", ({ lf2 }, name) => name && lf2.sounds.play_preset(name)],
    ["switch_difficulty", ({ lf2 }) => lf2.switch_difficulty()],
    ["destory_stage", ({ lf2 }) => lf2.remove_stage()],
    ["remove_all_entities", ({ lf2 }) => lf2.entities.del_all()],
    ["exit", () => window.confirm("确定退出?") && window.close()],
  ]);

  add(key: string, handler: IUIActionHandler): void {
    this._handler_map.set(key, handler);
  }

  act(layout: UINode, actions: TAction | TAction[]): void {
    if (!Array.isArray(actions)) actions = [actions]
    if (!actions.length) {
      Ditto.warn(`[${UIActor.TAG}::act] failed to act, actions empty`);
      return
    }
    for (const raw of actions) {
      const action = is_str(raw) ? parse_call_func_expression(raw) : raw;
      if (!action) {
        Ditto.warn(`[${UIActor.TAG}::act] failed to act, expression incorrect, expression: ${raw}`)
        continue;
      }
      const { name, args = [] } = action;
      const handler = this._handler_map.get(name);
      if (!handler) {
        Ditto.warn(`[${UIActor.TAG}::act] failed to act, handler not found by name, expression: ${raw}`)
        continue;
      }
      handler(layout, ...args);
    }
  }

}
const actor = new UIActor();
export default actor;
