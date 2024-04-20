import { Warn } from "../Log";
import { is_num } from "../common/is_num";
import { IBgData, IStageInfo, IStageObjectInfo, IStagePhaseInfo } from "../common/lf2_type";
import { Defines } from "../common/lf2_type/defines";
import { Background } from "./Background";
import StageObject from "./StageObject";
import type { World } from "./World";
import Callbacks from "./base/Callbacks";
import { Character } from "./entity/Character";
import { new_team } from "./base/new_id";

export interface IStageCallbacks {
  on_phase_changed?(
    stage: Stage,
    curr: IStagePhaseInfo | undefined,
    prev: IStagePhaseInfo | undefined
  ): void;
}

export default class Stage {
  readonly callbacks = new Callbacks<IStageCallbacks>();
  readonly world: World;
  readonly data: IStageInfo;
  readonly bg: Background;
  readonly enemy_team: number;
  private _disposed: boolean = false;
  private _disposers: (() => void)[] = [];
  private _bgm_enable: boolean;
  private _cur_phase_idx = -1;

  get left() { return this.bg.left }
  get right() { return this.bg.right }
  get near() { return this.bg.near }
  get far() { return this.bg.far }
  get width() { return this.bg.width }
  get depth() { return this.bg.depth }
  get middle() { return this.bg.middle }
  get lf2() { return this.world.lf2 }

  get player_left() { return this.bg.left }
  get player_right() { return this.data.phases[this._cur_phase_idx]?.bound ?? this.bg.right }

  constructor(world: World, data: IStageInfo | IBgData) {
    this.world = world;
    this._bgm_enable = this.world.lf2.bgm_enable;
    if ('type' in data && data.type === 'background') {
      this.data = Defines.THE_VOID_STAGE;
      this.bg = new Background(world, data);
    } else if ('bg' in data) {
      this.data = data;
      const bg_id = this.data.bg
      const bg_data = this.world.lf2.dat_mgr.backgrounds.find(v => v.id === bg_id || v.id === 'bg_' + bg_id)// FIXME;
      if (!bg_data) Warn.print(Stage.name, `bg_data not found, id: ${bg_id}`)
      this.bg = new Background(world, bg_data ?? Defines.THE_VOID_BG);
    } else {
      this.data = Defines.THE_VOID_STAGE;
      this.bg = new Background(world, Defines.THE_VOID_BG);
    }
    this.enemy_team = new_team()
    this.enter_phase(0);
  }
  private _stop_bgm?: () => void;

  private async try_play_phase_bgm() {
    const phase_info = this.data.phases[this._cur_phase_idx]
    if (!phase_info) return;
    if (!this._bgm_enable) return;
    const { lf2 } = this;
    const { music } = phase_info;
    if (!music) return;
    if (!lf2.sound_mgr.has(music))
      await lf2.sound_mgr.preload(music, lf2.import(music))
    if (this._disposed) return;
    this._stop_bgm = lf2.sound_mgr.play_bgm(music)
    this._disposers.push(this._stop_bgm);
  }

  enter_phase(idx: number) {

    if (this._cur_phase_idx === idx) return;

    const old: IStagePhaseInfo | undefined = this.data.phases[this._cur_phase_idx]
    const phase: IStagePhaseInfo | undefined = this.data.phases[this._cur_phase_idx = idx]

    if (this.all_done()) {
      const { next } = this.data;
      if (next) {
        const next_stage = this.lf2.stages.data?.find(v => v.id === next);
        if (next_stage) this.lf2.change_stage(next_stage)
      }
      return;
    }
    this.callbacks.emit('on_phase_changed')(this, phase, old);
    if (!phase) return;
    const { objects } = phase;
    this.try_play_phase_bgm()
    for (const object of objects) {
      this.spawn_object(object);
    }
  }

  set_bgm_enable(enabled: boolean) {
    this._bgm_enable = enabled;
    if (enabled) this.try_play_phase_bgm();
    else if (this._stop_bgm) this._stop_bgm();
  }

  stage_objects = new Set<StageObject>();
  async spawn_object(obj_info: IStageObjectInfo) {
    let count = 0;
    for (const [, c] of this.world.players) {
      count += c.data.base.ce ?? 1;
    }

    const { ratio = 1, times = 1 } = obj_info;
    let spawn_count = Math.floor(count * ratio);
    if (spawn_count <= 0 || !times) return;

    while ((--spawn_count) >= 0) {
      const stage_object = new StageObject(this, obj_info);
      stage_object.spawn();
      this.stage_objects.add(stage_object)

    }
  }
  kill_all_enemies() {
    for (const o of this.stage_objects) {
      if (!o.is_enemies) continue;
      for (const e of o.entities) {
        if (e instanceof Character) e.hp = 0;
      }
    }
  }
  kill_soliders() {
    for (const o of this.stage_objects) {
      if (!o.is_enemies) continue;
      if (!o.info.is_soldier) continue;
      for (const e of o.entities) {
        if (e instanceof Character) e.hp = 0;
      }
    }
  }
  kill_boss() {
    for (const o of this.stage_objects) {
      if (!o.is_enemies) continue;
      if (!o.info.is_boss) continue;
      for (const e of o.entities) {
        if (e instanceof Character) e.hp = 0;
      }
    }
  }
  kill_others() {
    for (const o of this.stage_objects) {
      if (!o.is_enemies) continue;
      if (o.info.is_boss || o.info.is_soldier) continue;
      for (const e of o.entities) {
        if (e instanceof Character) e.hp = 0;
      }
    }
  }
  dispose() {
    this._disposed = true;
    for (const f of this._disposers) f();
    this.bg.dispose();
    for (const so of this.stage_objects) {
      so.dispose();
    }
  }
  all_boss_dead(): boolean {
    return !find_in_set(this.stage_objects, i => i.info.is_boss)
  }
  all_enemies_dead(): boolean {
    return !find_in_set(this.stage_objects, i => i.is_enemies)
  }
  all_done(): boolean {
    return this._cur_phase_idx === this.data.phases.length;
  }
  handle_empty_stage_object(stage_object: StageObject) {
    const { times, is_soldier } = stage_object.info;
    if (is_soldier) {
      if (this.all_boss_dead()) {
        this.stage_objects.delete(stage_object);
        stage_object.dispose();
      } else if (!is_num(times) || times > 0) {
        stage_object.spawn();
      }
    } else if (times) {
      stage_object.spawn();
    } else {
      this.stage_objects.delete(stage_object);
      stage_object.dispose();
    }
    if (this.all_enemies_dead()) {
      this.enter_phase(this._cur_phase_idx + 1);
    }
  }
}
function find_in_set<T>(set: Set<T>, p: (v: T) => any): T | undefined {
  for (const i of set) {
    if (p(i)) return i;
  }
}