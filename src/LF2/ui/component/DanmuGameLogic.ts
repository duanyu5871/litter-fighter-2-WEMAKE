import { Defines, IEntityData, BuiltIn_OID as OID } from "../../defines";
import { TeamEnum as TE } from "../../defines/TeamEnum";
import { IEntityCallbacks } from "../../entity";
import { Entity } from "../../entity/Entity";
import { IWorldCallbacks } from "../../IWorldCallbacks";
import { Times } from "../utils/Times";
import { CameraCtrl } from "./CameraCtrl";
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

  private _staring_countdown = new Times(0, 60 * 30);
  private _gameover_countdown = new Times(0, 60 * 5);
  private _teams = new Set<string>();
  private _cam_ctrl?: CameraCtrl

  readonly team_sum = new Map<string, ISumInfo>([
    [TE.Team_1, make_team_sum(TE.Team_1)],
    [TE.Team_2, make_team_sum(TE.Team_2)],
    [TE.Team_3, make_team_sum(TE.Team_3)],
    [TE.Team_4, make_team_sum(TE.Team_4)]
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
  time: number = 0;
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
    if (!this._cam_ctrl || this._cam_ctrl?.staring !== e) return
    // 聚焦角色被移除后，聚焦下一个角色
    this._staring_countdown.reset();
    this._cam_ctrl.staring = this.lf2.random_get(this.lf2.characters.list())
  }
  override on_start(): void {
    super.on_start?.();
    this.world.callbacks.add(this._world_cb)
    this.update_bg();
    this.lf2.sounds.play_bgm('?')
    this.lf2.on_component_broadcast(this, DanmuGameLogic.BROADCAST_ON_START)
    this._cam_ctrl = this.node.find_component(CameraCtrl)
  }
  override on_stop(): void {
    super.on_stop?.();
    this.world.callbacks.del(this._world_cb);
    this.world.lock_cam_x = void 0;
    this.lf2.on_component_broadcast(this, DanmuGameLogic.BROADCAST_ON_STOP);
    this.lf2.change_bg(Defines.VOID_BG)
  }

  update_bg() {
    this.lf2.change_bg('bg_4');

    const fighter_enter = (v: Entity) => {
      v.is_key_role = v.is_gone_dead = true;
      v.name = v.data.base.name;
      v.blinking = 120;
    }
    // this.lf2.characters.add(OID.Julian, 2, TE.Team_1).forEach(fighter_enter)
    // this.lf2.characters.add(OID.Firzen, 3, TE.Team_2).forEach(fighter_enter)
    // this.lf2.characters.add(OID.LouisEX, 2, TE.Team_3).forEach(fighter_enter)
    // this.lf2.characters.add(OID.Bat, 3, TE.Team_3).forEach(fighter_enter)

    // this.lf2.characters.add(OID.Deep, 1, TE.Team_4).forEach(fighter_enter)
    // this.lf2.characters.add(OID.Davis, 1, TE.Team_4).forEach(fighter_enter)
    // this.lf2.characters.add(OID.Dennis, 1, TE.Team_4).forEach(fighter_enter)
    // this.lf2.characters.add(OID.Woody, 1, TE.Team_4).forEach(fighter_enter)
    // this.lf2.characters.add(OID.Firen, 1, TE.Team_4).forEach(fighter_enter)
    // this.lf2.characters.add(OID.Freeze, 1, TE.Team_4).forEach(fighter_enter)
    // this.lf2.characters.add(OID.Jack, 1, TE.Team_4).forEach(fighter_enter)
    this.lf2.characters.add(OID.Deep, 1, '').forEach(fighter_enter)
    this.lf2.characters.add(OID.Davis, 1, '').forEach(fighter_enter)
    this.lf2.characters.add(OID.Dennis, 1, '').forEach(fighter_enter)
    this.lf2.characters.add(OID.Woody, 1, '').forEach(fighter_enter)
    this.lf2.characters.add(OID.Firen, 1, '').forEach(fighter_enter)
    this.lf2.characters.add(OID.Freeze, 1, '').forEach(fighter_enter)
    this.lf2.characters.add(OID.Jack, 1, '').forEach(fighter_enter)
    this.lf2.characters.add(OID.Louis, 1, '').forEach(fighter_enter)

    this.update_staring();
    this._staring_countdown.reset()

    const staring = this._cam_ctrl?.staring;
    if (staring && this._cam_ctrl?.free != false) {
      const { left, right } = this.world.stage;
      let cam_x = staring.position.x - this.world.screen_w / 2
      const max_cam_left = left;
      const max_cam_right = right;
      if (cam_x < max_cam_left) cam_x = max_cam_left;
      if (cam_x > max_cam_right - this.world.screen_w) cam_x = max_cam_right - this.world.screen_w;
      this.world.lock_cam_x = cam_x
      this.world.renderer.cam_x = cam_x;
    }
  }
  update_staring() {
    if (!this._cam_ctrl) return;
    const fighters = this.lf2.characters.list();
    this._cam_ctrl.staring = this.lf2.random_get(fighters)
  }
  override update(dt: number): void {
    this.time += dt;
    super.update?.(dt)
    this._staring_countdown.add();
    if (this._staring_countdown.is_end()) this.update_staring()

    const staring = this._cam_ctrl?.staring;
    if (staring && this._cam_ctrl?.free != false)
      this.world.lock_cam_x = staring.position.x - this.world.screen_w / 2
    else if (!staring)
      this.update_staring()

    if (this._teams.size <= 1) {
      if (this._gameover_countdown.is_end()) {
        if (this._teams.size) {
          for (const [k, v] of this.team_sum) {
            if (this._teams.has(k)) v.wins += 1
            else v.loses += 1
          }
        }
        this._gameover_countdown.reset()
        this.update_bg()
      } else {
        this._gameover_countdown.add()
      }
    } else {
      this._gameover_countdown.reset()
    }

  }

}

