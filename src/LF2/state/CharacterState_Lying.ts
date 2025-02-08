import { Defines, type IFrameInfo } from "../defines";
import type Entity from "../entity/Entity";
import CharacterState_Base from "./CharacterState_Base";

export default class CharacterState_Lying extends CharacterState_Base {
  override enter(e: Entity, prev_frame: IFrameInfo): void {
    if (e.frame.state === Defines.State.Lying && e.hp <= 0) {
      if (!e.in_player_slot) {
        // 非玩家槽的角色在被击败时，闪烁着离开了这个世界
        e.blink_and_gone(e.world.gone_blink_time);
      }
    }
    e.drop_holding();
  }
  override leave(e: Entity, next_frame: IFrameInfo): void {
    if (e.in_player_slot) {
      // 玩家槽的角色起身时会闪烁的无敌时间
      e.blinking = e.world.lying_blink_time;
    }
  }
}
