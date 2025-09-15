import { IActionHandler } from "../base/IActionHandler";

export const itr_action_handlers: IActionHandler = {
  sound: (a, c) => c.attacker.play_sound(a.data.path, a.data.pos),
  next_frame: (a, c) => c.attacker.next_frame = c.attacker.get_next_frame(a.data)?.which ?? c.attacker.next_frame,
  set_prop: (a, c) => (c.attacker as any)[a.prop_name] = a.prop_value,
  broken_defend: () => 0,
  defend: () => 0,
};
