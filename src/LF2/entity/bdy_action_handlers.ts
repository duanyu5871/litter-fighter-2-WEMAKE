import { IActionHandler } from "../base";

export const bdy_action_handlers: IActionHandler = {
  sound: (a, c) => c.victim.play_sound(a.data.path, a.data.pos),
  next_frame: (a, c) => c.victim.next_frame = c.victim.get_next_frame(a.data)?.which ?? c.victim.next_frame,
  set_prop: (a, c) => (c.victim as any)[a.prop_name] = a.prop_value,
  broken_defend: () => 0,
  defend: () => 0,
};

