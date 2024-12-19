import type { IFrameInfo } from "../defines";
import { Defines } from "../defines/defines";
import type Character from '../entity/Character';
import CharacterState_Base from "./CharacterState_Base";

export default class CharacterState_Lying extends CharacterState_Base {
  override enter(e: Character, prev_frame: IFrameInfo): void {
    if (e.frame.state === Defines.State.Lying && e.hp <= 0) {
      if (!e.in_player_slot) { // 非玩家槽的角色在被击败时，闪烁着离开了这个世界
        e.blink_and_gone(60);
      }
    }
  }
  override leave(e: Character, next_frame: IFrameInfo): void {
    if (e.in_player_slot) {
      // 玩家槽的角色起身时会闪烁的无敌时间
      e.blink(60);
    }
  }
}
