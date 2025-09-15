import { IActionHandler } from "../base";
import { ItrKind } from "../defines";

export const bdy_action_handlers: IActionHandler = {
  sound: (a, { itr, victim }) => victim.play_sound(a.data.path, a.data.pos),
  next_frame: (a, { victim }) => {
    victim.next_frame = victim.get_next_frame(a.data)?.frame ?? victim.next_frame;
  },
  set_prop: (a, { victim }) => {
    (victim as any)[a.prop_name] = a.prop_value;
  },
  broken_defend: () => 0,
  defend: () => 0,
};

