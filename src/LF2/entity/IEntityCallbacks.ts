import type Entity from './Entity';

export default interface IEntityCallbacks<E extends Entity = Entity> {
  /**
   * 
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
  on_max_hp_changed?(e: E, value: number, prev: number): void;

  /**
   * 最大气量变化
   *
   * @param {E} e
   * @param {number} value 当前值
   * @param {number} prev 上一次值
   */
  on_max_mp_changed?(e: E, value: number, prev: number): void;
  
  
  /**
   * 血量变化
   *
   * @param {E} e
   * @param {number} value 当前值
   * @param {number} prev 上一次值
   */
  on_hp_changed?(e: E, value: number, prev: number): void;

  /**
   * Description placeholder
   *
   * @param {E} e
   * @param {number} value 当前值
   * @param {number} prev 上一次值
   */
  on_mp_changed?(e: E, value: number, prev: number): void;
  
  /**
   * Description placeholder
   *
   * @param {E} e
   * @param {number} value 当前值
   * @param {number} prev 上一次值
   */
  on_self_healing_hp_changed?(e: E, value: number, prev: number): void;
  
  /**
   * Description placeholder
   *
   * @param {E} e
   * @param {number} value 当前值
   * @param {number} prev 上一次值
   */
  on_self_healing_mp_changed?(e: E, value: number, prev: number): void;
  on_team_changed?(e: E, value: string, prev: string): void;
  on_name_changed?(e: E, value: string, prev: string): void;
  on_disposed?(e: E): void;
}
