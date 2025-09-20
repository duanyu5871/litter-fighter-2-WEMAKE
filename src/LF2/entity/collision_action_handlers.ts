import { ICollision } from "../base";
import { IActionHandler } from "../base/IActionHandler";
import { ActionType } from "../defines/ActionType";
import { IAction_ReboundVX } from "../defines/IAction_ReboundVX";
import { IAction_TurnFace } from "../defines/IAction_TurnFace";
import { turn_face } from "./face_helper";

export const collision_action_handlers: IActionHandler = {
  a_sound: (a, c) => c.attacker.play_sound(a.data.path, a.data.pos),
  a_next_frame: (a, c) => c.attacker.next_frame = c.attacker.get_next_frame(a.data)?.which ?? c.attacker.next_frame,
  a_set_prop: (a, c) => (c.attacker as any)[a.prop_name] = a.prop_value,
  a_broken_defend: () => 0, // 特殊对待，此处留空
  a_defend: () => 0, // 特殊对待，此处留空

  v_sound: (a, c) => c.victim.play_sound(a.data.path, a.data.pos),
  v_next_frame: (a, c) => c.victim.next_frame = c.victim.get_next_frame(a.data)?.which ?? c.victim.next_frame,
  v_set_prop: (a, c) => (c.victim as any)[a.prop_name] = a.prop_value,
  v_broken_defend: () => 0, // 特殊对待，此处留空
  v_defend: () => 0,

  [ActionType.A_REBOUND_VX]: function (action: IAction_ReboundVX, collision: ICollision) {
    const { attacker } = collision;
    attacker.merge_velocities();
    attacker.velocity_0.x = -attacker.velocity_0.x;
  },
  [ActionType.V_REBOUND_VX]: function (action: IAction_ReboundVX, collision: ICollision) {
    const { victim } = collision;
    victim.merge_velocities();
    victim.velocity_0.x = -victim.velocity_0.x;
  },
  [ActionType.V_TURN_FACE]: function (action: IAction_TurnFace, collision: ICollision) {
    const { victim } = collision;
    victim.facing = turn_face(victim.facing);
  }
};
