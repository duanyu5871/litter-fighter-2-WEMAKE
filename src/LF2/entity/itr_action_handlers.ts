import { IActionHandler } from "../base/IActionHandler";

export const itr_action_handlers: IActionHandler = {
  sound: (a, { attacker }) => attacker.play_sound(a.data.path, a.data.pos),
  next_frame: (a, { attacker }) => {
    attacker.next_frame = attacker.get_next_frame(a.data)?.frame ?? attacker.next_frame;
  },
  set_prop: (a, { attacker }) => {
    (attacker as any)[a.prop_name] = a.prop_value;
  },
  broken_defend: () => 0,
  defend: () => 0,
};
