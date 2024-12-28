import { World } from "./World";
import type Stage from "./stage/Stage";

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

  /**
   * 渲染帧率变化回调
   *
   * @param {number} fps
   */
  on_fps_update?(fps: number): void;

  /**
   * 更新帧率变化回调
   *
   * @param {number} fps
   * @param {number} score 性能评分[0,100]
   */
  on_ups_update?(fps: number, score: number): void;

  on_gravity_change?(value: number, prev: number, world: World): void;

  on_is_sync_render_changed?(value: 0 | 1 | 2, prev: 0 | 1 | 2): void;
}
