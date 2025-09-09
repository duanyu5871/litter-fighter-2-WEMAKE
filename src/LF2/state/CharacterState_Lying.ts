import { StateEnum, type IFrameInfo } from "../defines";
import { TeamEnum } from "../defines/TeamEnum";
import type { Entity } from "../entity/Entity";
import CharacterState_Base from "./CharacterState_Base";

export default class CharacterState_Lying extends CharacterState_Base {

  override enter(e: Entity, prev_frame: IFrameInfo): void {
    e.drop_holding();
    const player_teams = new Set<string>()
    for (const [, f] of e.world.slot_fighters) {
      player_teams.add(f.team)
    }
    if (e.frame.state === StateEnum.Lying && e.hp <= 0) {
      if (e.reserve) --e.reserve;

      if (e.reserve && player_teams.has(e.team)) {
        // 玩家队伍的复活到玩家附近。
        e.blink_and_respawn(e.world.gone_blink_time);
      } else if (e.join_dead) {

      } else if (e.is_gone_dead) {
        // 非玩家槽的角色在被击败时，闪烁着离开了这个世界
        e.blink_and_gone(e.world.gone_blink_time);
      }
    }
  }
  override leave(e: Entity, next_frame: IFrameInfo): void {
    if (e.is_key_role) {
      // 玩家槽的角色起身时会闪烁的无敌时间
      e.blinking = e.world.lying_blink_time;
    }
  }

  override find_frame_by_id(e: Entity, id: string | undefined): IFrameInfo | undefined {
    if (
      e.hp <= 0 &&
      e.position.y <= 0 &&
      e.frame.state === StateEnum.Lying
    ) {
      if (e.join_dead) {
        e.team = (e.join_dead.team ?? TeamEnum.Team_1);
        e.hp = e.hp_r = e.hp_max = (e.join_dead.hp ?? e.hp_max)
        return void 0;
      }
      return e.frame;
    }
  }
}
