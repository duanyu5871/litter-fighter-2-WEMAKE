import { IActionHandler } from "../base/IActionHandler";

export const collision_action_handlers: IActionHandler = {
  a_sound: (a, c) => c.attacker.play_sound(a.data.path, a.data.pos),
  a_next_frame: (a, c) => c.attacker.next_frame = c.attacker.get_next_frame(a.data)?.which ?? c.attacker.next_frame,
  a_set_prop: (a, c) => (c.attacker as any)[a.prop_name] = a.prop_value,
  a_broken_defend: () => 0,
  a_defend: () => 0,

  v_sound: (a, c) => c.victim.play_sound(a.data.path, a.data.pos),
  v_next_frame: (a, c) => c.victim.next_frame = c.victim.get_next_frame(a.data)?.which ?? c.victim.next_frame,
  v_set_prop: (a, c) => (c.victim as any)[a.prop_name] = a.prop_value,
  v_broken_defend: () => 0,
  v_defend: () => 0,
};
