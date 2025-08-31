import { BuiltIn_OID, Defines, EntityGroup, IEntityData } from "../../defines";
import { TeamEnum } from "../../defines/TeamEnum";
import { IEntityCallbacks } from "../../entity";
import { Entity } from "../../entity/Entity";
import { IWorldCallbacks } from "../../IWorldCallbacks";
import { intersection } from "../../utils";
import { Times } from "../utils/Times";
import { UIComponent } from "./UIComponent";
export interface ISumInfo {
  wins: number;
  loses: number;
  kills: number,
  damages: number,
  pickings: number,
  spawns: number,
  deads: number,
  team: string,
}
const make_team_sum = (team: string): ISumInfo => ({
  wins: 0,
  loses: 0,
  kills: 0,
  damages: 0,
  pickings: 0,
  spawns: 0,
  deads: 0,
  team
})
export interface IFighterSumInfo extends ISumInfo {
  data: IEntityData,
}
const make_fighter_sum = (data: IEntityData): IFighterSumInfo => {
  return { ...make_team_sum(''), data }
}
export class DanmuGameLogic extends UIComponent {
  static override readonly TAG = 'DanmuGameLogic';
  static readonly BROADCAST_ON_START = 'DanmuGameLogic_ON_START';
  static readonly BROADCAST_ON_STOP = 'DanmuGameLogic_ON_STOP';

  private _countdown = new Times(0, 60 * 30);
  private _staring: Entity | undefined;
  private _teams = new Set<string>();
  readonly team_sum = new Map<string, ISumInfo>([
    [TeamEnum.Team_1, make_team_sum(TeamEnum.Team_1)],
    [TeamEnum.Team_2, make_team_sum(TeamEnum.Team_2)],
    [TeamEnum.Team_3, make_team_sum(TeamEnum.Team_3)],
    [TeamEnum.Team_4, make_team_sum(TeamEnum.Team_4)]
  ])
  readonly fighter_sum = new Map<string, IFighterSumInfo>()
  private _world_cb: IWorldCallbacks = {
    on_fighter_del: e => this.on_fighter_del(e),
    on_fighter_add: e => this.on_fighter_add(e),
  }
  private _fighter_cb: IEntityCallbacks = {
    on_damage_sum_changed: (e, value, prev) => {
      // 母体还在，避免重算
      if (e.emitter?.is_attach === true) return;
      const sum = this.team_sum.get(e.team)
      if (sum) sum.damages += value - prev;

      const sum2 = this.fighter_sum.get(e.data.id)
      if (sum2) sum2.damages += value - prev;
    },
    on_kill_sum_changed: (e, value, prev) => {
      // 母体还在，避免重算
      if (e.emitter?.is_attach === true) return;
      const sum = this.team_sum.get(e.team)
      if (sum) sum.kills += value - prev;

      const sum2 = this.fighter_sum.get(e.data.id)
      if (sum2) sum2.kills += value - prev;
    },
    on_picking_sum_changed: (e, value, prev) => {
      const sum = this.team_sum.get(e.team)
      if (sum) sum.pickings += value - prev;

      const sum2 = this.fighter_sum.get(e.data.id)
      if (sum2) sum2.pickings += value - prev;
    },
    on_dead: (e) => {
      // 分身死亡不计算
      if (e.emitter) return;
      const sum = this.team_sum.get(e.team)
      if (sum) sum.deads++;
      const sum2 = this.fighter_sum.get(e.data.id)
      if (sum2) sum2.deads++;
    }
  }
  override init(...args: any[]): this {
    super.init(...args)
    this.lf2.datas.characters.map(v => this.fighter_sum.set(v.id, make_fighter_sum(v)))
    return this;
  }
  update_teams() {
    const fighters = this.lf2.characters.list();
    this._teams.clear()
    for (const fighter of fighters)
      this._teams.add(fighter.team);
  }
  on_fighter_add(e: Entity) {
    e.callbacks.add(this._fighter_cb)

    if (!e.emitter) { // 忽略分身计数
      const sum = this.team_sum.get(e.team)
      if (sum) sum.spawns++;
      const sum2 = this.fighter_sum.get(e.data.id)
      if (sum2) sum2.spawns++;
    }
    this.update_teams()
  }
  on_fighter_del(e: Entity) {
    e.callbacks.del(this._fighter_cb)
    this.update_teams()
    if (this.staring !== e) return
    // 聚焦角色被移除后，聚焦下一个角色
    this._countdown.reset();
    this.staring = this.lf2.random_get(this.lf2.characters.list())
  }
  get staring(): Entity | undefined {
    return this._staring;
  }
  set staring(v: Entity | undefined) {
    this._staring = v;
  };
  override on_start(): void {
    super.on_start?.();
    this.update_bg();
    this.world.callbacks.add(this._world_cb)
    this.lf2.sounds.play_bgm('?')
    this.lf2.on_component_broadcast(this, DanmuGameLogic.BROADCAST_ON_START)
  }
  override on_stop(): void {
    super.on_stop?.();
    this.world.callbacks.del(this._world_cb);
    this.world.lock_cam_x = void 0;
    this.lf2.on_component_broadcast(this, DanmuGameLogic.BROADCAST_ON_STOP);
    this.lf2.change_bg(Defines.VOID_BG)
  }

  update_bg() {
    this.lf2.change_bg('?');
    // this.lf2.characters
    //   .add_random(20, '?', e => {
    //     return (0 == intersection(e.base.group, [EntityGroup.Boss]).length ||
    //       e.id == BuiltIn_OID.Bat ||
    //       e.id == BuiltIn_OID.LouisEX
    //     )
    //   }).forEach(v => {
    //     v.is_key_role = true;
    //     v.is_gone_dead = true;
    //     v.name = v.data.base.name;
    //     v.blinking = 120;
    //   })

    // this.lf2.characters
    //   .add_random(this.lf2.random_in(0, 3), '', e => e.id == BuiltIn_OID.Julian || e.id == BuiltIn_OID.Firzen)
    //   .forEach(v => {
    //     v.is_key_role = true;
    //     v.is_gone_dead = true;
    //     v.blinking = 120;
    //   })

    this.lf2.characters
      .add(BuiltIn_OID.Julian, 3, TeamEnum.Team_1).forEach(v => {
        v.is_key_role = v.is_gone_dead = true;
        v.name = v.data.base.name;
        v.blinking = 120;
      })
    this.lf2.characters
      .add(BuiltIn_OID.Firzen, 4, TeamEnum.Team_2).forEach(v => {
        v.is_key_role = v.is_gone_dead = true;
        v.name = v.data.base.name;
        v.blinking = 120;
      })
    this.lf2.characters
      .add(BuiltIn_OID.Bat, 6, TeamEnum.Team_3).forEach(v => {
        v.is_key_role = v.is_gone_dead = true;
        v.name = v.data.base.name;
        v.blinking = 120;
      })

    this.update_staring();
    this._countdown.reset()
    const { staring } = this
    if (staring) {
      this.world.lock_cam_x = this.world.renderer.cam_x = staring.position.x - this.world.screen_w / 2
    }
  }
  update_staring() {
    const fighters = this.lf2.characters.list();
    this.staring = this.lf2.random_get(fighters)
  }
  override update(dt: number): void {
    super.update?.(dt)
    this._countdown.add();
    if (this._countdown.is_end()) this.update_staring()

    const { staring } = this
    if (staring) this.world.lock_cam_x = staring.position.x - this.world.screen_w / 2
    else if (!staring) this.update_staring()

    if (this._teams.size <= 1) {
      if (this._teams.size) {
        for (const [k, v] of this.team_sum) {
          if (this._teams.has(k)) v.wins += 1
          else v.loses += 1
        }
      }
      this.update_bg()
    }
  }
}
