import type { Defines } from "../defines";
import type { Unsafe } from "../utils/type_check";
import type Entity from "./Entity";

export default interface IEntityCallbacks<E extends Entity = Entity> {
  on_holder_changed?(e: E, value: Unsafe<Entity>, prev: Unsafe<Entity>): void;

  on_holding_changed?(e: E, value: Unsafe<Entity>, prev: Unsafe<Entity>): void;

  on_picking_sum_changed?(e: E, value: number, prev: number): void;

  /**
   * 造成的击杀数
   *
   * @param {E} e
   * @param {number} value 当前值
   * @param {number} prev 上一次值
   */
  on_kill_sum_changed?(e: E, value: number, prev: number): void;

  /**
   * 造成的伤害总数
   *
   * @param {E} e
   * @param {number} value 当前值
   * @param {number} prev 上一次值
   */
  on_damage_sum_changed?(e: E, value: number, prev: number): void;

  /**
   * 最大血量变化
   *
   * @param {E} e
   * @param {number} value 当前值
   * @param {number} prev 上一次值
   */
  on_hp_max_changed?(e: E, value: number, prev: number): void;

  /**
   * 最大气量变化
   *
   * @param {E} e
   * @param {number} value 当前值
   * @param {number} prev 上一次值
   */
  on_mp_max_changed?(e: E, value: number, prev: number): void;

  /**
   * 血量变化
   *
   * @param {E} e
   * @param {number} value 当前值
   * @param {number} prev 上一次值
   */
  on_hp_changed?(e: E, value: number, prev: number): void;

  /**
   * 气量变化
   *
   * @param {E} e
   * @param {number} value 当前值
   * @param {number} prev 上一次值
   */
  on_mp_changed?(e: E, value: number, prev: number): void;

  /**
   * 队伍变化
   *
   * @param {E} e
   * @param {string} value
   * @param {string} prev
   */
  on_team_changed?(e: E, value: string, prev: string): void;

  /**
   * 玩家名变化
   *
   * @param e
   * @param value
   * @param prev
   */
  on_name_changed?(e: E, value: string, prev: string): void;

  /**
   * 角色倒地死亡回调
   *
   * 当角色hp为0，且状态处于Lying时触发
   *
   * @see {Defines.State.Lying}
   * @param {E} e
   */
  on_dead?(e: E): void;

  on_disposed?(e: E): void;

  /**
   *
   *
   * @param {E} e
   * @param {number} value 当前值
   * @param {number} prev 上一次值
   */
  on_fall_value_max_changed?(e: E, value: number, prev: number): void;

  /**
   *
   *
   * @param {E} e
   * @param {number} value 当前值
   * @param {number} prev 上一次值
   */
  on_fall_value_changed?(e: E, value: number, prev: number): void;

  /**
   *
   *
   * @param {E} e
   * @param {number} value 当前值
   * @param {number} prev 上一次值
   */
  on_defend_value_max_changed?(e: E, value: number, prev: number): void;

  /**
   *
   *
   * @param {E} e
   * @param {number} value 当前值
   * @param {number} prev 上一次值
   */
  on_defend_value_changed?(e: E, value: number, prev: number): void;

  /**
   *
   *
   * @param {E} e
   * @param {number} value 当前值
   * @param {number} prev 上一次值
   */
  on_resting_max_changed?(e: E, value: number, prev: number): void;

  /**
   *
   *
   * @param {E} e
   * @param {number} value 当前值
   * @param {number} prev 上一次值
   */
  on_resting_changed?(e: E, value: number, prev: number): void;

  on_resting_max_changed?(e: E, value: number, prev: number): void;

  /**
   * 
   *
   * @param {E} e
   * @param {number} value 当前值
   * @param {number} prev 上一次值
   */
  on_hp_r_changed?(e: E, value: number, prev: number): void;


  /**
   * 
   * @param {E} e
   * @param {number} value 当前值
   * @param {number} prev 上一次值
   */
  on_healing_changed?(e: E, value: number, prev: number): void;
  
}
