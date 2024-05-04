import Entity from './Entity';

export interface IEntityCallbacks<E extends Entity = Entity> {
  on_max_hp_changed?(e: E, value: number, prev: number): void;
  on_max_mp_changed?(e: E, value: number, prev: number): void;
  on_hp_changed?(e: E, value: number, prev: number): void;
  on_mp_changed?(e: E, value: number, prev: number): void;
  on_self_healing_hp_changed?(e: E, value: number, prev: number): void;
  on_self_healing_mp_changed?(e: E, value: number, prev: number): void;


  on_team_changed?(e: E, value: string, prev: string): void;
  on_name_changed?(e: E, value: string, prev: string): void;
  on_disposed?(e: E): void;
}
