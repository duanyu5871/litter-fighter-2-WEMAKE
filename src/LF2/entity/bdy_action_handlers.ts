import type { IAction_NextFrame, IAction_SetProp, IAction_Sound, TAction } from "../defines/Action";
import type { ICollision } from "../defines/ICollision";
import { ItrKind } from "../defines/ItrKind";

export const bdy_action_handlers: Record<TAction['type'], (action: TAction, collision: ICollision) => any> = {
  sound: (action: TAction, { itr, victim }: ICollision) => {
    const a = action as IAction_Sound;
    if (itr.kind !== ItrKind.Block &&
      itr.kind !== ItrKind.Whirlwind &&
      itr.kind !== ItrKind.MagicFlute &&
      itr.kind !== ItrKind.MagicFlute2) {
      victim.play_sound(a.path, a.pos);
    }
  },
  next_frame: (action: TAction, { victim }: ICollision) => {
    const a = action as IAction_NextFrame;
    victim.next_frame = victim.get_next_frame(a.data)?.frame ?? victim.next_frame;
  },
  set_prop: (action: TAction, { victim }: ICollision) => {
    const a = action as IAction_SetProp;
    (victim as any)[a.prop_name] = a.prop_value;
  },
  broken_defend: () => 0,
  defend: () => 0,
};

export const itr_action_handlers: Record<TAction['type'], (action: TAction, collision: ICollision) => any> = {
  sound: (action: TAction, { itr, attacker }: ICollision) => {
    const a = action as IAction_Sound;
    if (itr.kind !== ItrKind.Block &&
      itr.kind !== ItrKind.Whirlwind &&
      itr.kind !== ItrKind.MagicFlute &&
      itr.kind !== ItrKind.MagicFlute2) {
      attacker.play_sound(a.path, a.pos);
    }
  },
  next_frame: (action: TAction, { attacker }: ICollision) => {
    const a = action as IAction_NextFrame;
    attacker.next_frame = attacker.get_next_frame(a.data)?.frame ?? attacker.next_frame;
  },
  set_prop: (action: TAction, { attacker }: ICollision) => {
    const a = action as IAction_SetProp;
    (attacker as any)[a.prop_name] = a.prop_value;
  },
  broken_defend: () => 0,
  defend: () => 0,
};
