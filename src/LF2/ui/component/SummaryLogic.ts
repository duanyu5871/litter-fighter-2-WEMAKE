import { Entity, IEntityCallbacks } from "../../entity";
import { IWorldCallbacks } from "../../IWorldCallbacks";
import { IFighterSumInfo, IPlayerSumInfo } from "./IFighterSumInfo";
import { ISumInfo } from "./ISumInfo";
import { make_fighter_sum } from "./make_fighter_sum";
import { make_player_sum } from "./make_player_sum";
import { make_sum_info } from "./make_sum_info";
import { UIComponent } from "./UIComponent";

export class SummaryLogic extends UIComponent {
  static override readonly TAG: string = 'SummaryLogic';
  readonly fighters = new Map<string, IFighterSumInfo>();
  readonly players = new Map<string, IPlayerSumInfo>();
  readonly teams = new Map<string, ISumInfo>();
  readonly losing_teams = new Set<ISumInfo>();

  team_sum(entity: Entity): ISumInfo {
    const { team } = entity;
    let ret = this.teams.get(team)
    if (!ret) this.teams.set(team, ret = make_sum_info(team))
    return ret;
  }
  fighter_sum(entity: Entity): IFighterSumInfo {
    let ret = this.fighters.get(entity.data.id)
    if (!ret) this.fighters.set(entity.data.id, ret = make_fighter_sum(entity.data))
    return ret;
  }
  player_sum(entity: Entity): IFighterSumInfo {
    let ret = this.players.get(entity.ctrl.player_id)
    if (!ret) this.players.set(entity.ctrl.player_id, ret = make_player_sum(entity))
    return ret;
  }
  private _world_cb: IWorldCallbacks = {
    on_fighter_del: e => this.on_fighter_del(e),
    on_fighter_add: e => this.on_fighter_add(e),
  };
  private _fighter_cb: IEntityCallbacks = {
    on_damage_sum_changed: (e, value, prev) => {
      // 母体还在，避免重算
      if (e.emitter?.is_attach === true) return;
      this.team_sum(e).damages += value - prev;
      this.fighter_sum(e).damages += value - prev;
      this.player_sum(e).damages += value - prev;
    },
    on_kill_sum_changed: (e, value, prev) => {
      // 母体还在，避免重算
      if (e.emitter?.is_attach === true) return;
      this.team_sum(e).kills += value - prev;
      this.fighter_sum(e).kills += value - prev;
      this.player_sum(e).kills += value - prev;
    },
    on_picking_sum_changed: (e, value, prev) => {
      this.team_sum(e).pickings += value - prev;
      this.fighter_sum(e).pickings += value - prev;
      this.player_sum(e).pickings += value - prev;
    },
    on_dead: (e) => {
      // 分身死亡不计算
      if (e.emitter) return;
      const team_sum = this.team_sum(e);
      team_sum.deads++;
      team_sum.latest_dead_time = this.node.update_times;
      if (team_sum.deads === team_sum.spawns)
        this.losing_teams.add(team_sum)
      this.fighter_sum(e).deads++;
      this.player_sum(e).deads++;
    }
  };
  on_fighter_add(e: Entity) {
    e.callbacks.add(this._fighter_cb);
    if (!e.emitter) { // 忽略分身计数
      const team_sum = this.team_sum(e);
      team_sum.spawns++;
      this.losing_teams.delete(team_sum);
      this.fighter_sum(e).spawns++;
      this.player_sum(e).spawns++;
    }
  }
  on_fighter_del(e: Entity) {
    e.callbacks.del(this._fighter_cb);
  }
  override on_start(): void {
    super.on_start?.();
    this.world.callbacks.add(this._world_cb);
  }
  override on_stop(): void {
    super.on_stop?.();
    this.world.callbacks.del(this._world_cb);
  }

  private _temps: ISumInfo[] = []
  override update(dt: number): void {
    super.update?.(dt);

    if (this.losing_teams.size) {
      for (const losing_team of this.losing_teams) {
        const is_waiting = this.node.update_times - losing_team.latest_dead_time < 180;
        if (is_waiting) continue;
        losing_team.loses++;
        this._temps.push(losing_team);
      }
    }
    if (this._temps.length) {
      this._temps.forEach(i => this.losing_teams.delete(i))
      this._temps.length = 0;
    }
  }
}
