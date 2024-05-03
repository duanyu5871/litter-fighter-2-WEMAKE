import type Stage from './stage/Stage';

export interface IWorldCallbacks {
  on_disposed?(): void;

  /**
   * 场景被修改
   *
   * @param {Stage} curr 新场景
   * @param {Stage} prev 前一场景
   */
  on_stage_change?(curr: Stage, prev: Stage): void;


  /**
   * 
   * @todo 这个回调比较高频似乎不应该放在此处
   * @param {number} x
   */
  on_cam_move?(x: number): void;

  on_pause_change?(pause: boolean): void;

  on_player_character_add?(player_id: string): void;
  on_player_character_del?(player_id: string): void;

}
