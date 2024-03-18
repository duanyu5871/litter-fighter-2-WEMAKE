import random_get from "../Utils/random_get";
import { is_num } from "../js_utils/is_num";
import { is_str } from "../js_utils/is_str";
import { IBgData, IStageInfo, IStageObjectInfo, IStagePhaseInfo } from "../js_utils/lf2_type";
import { Defines } from "../js_utils/lf2_type/defines";
import { Background } from "./Background";
import { factory } from "./Factory";
import type { World } from "./World";
import { BotEnemyChaser } from "./controller/BotEnemyChaser";
import { Character } from "./entity/Character";
import { Entity, IEntityCallbacks } from "./entity/Entity";
import { Weapon } from "./entity/Weapon";
import { random_in_range } from "./random_in_range";

class StageObject implements IEntityCallbacks {
  readonly is_enemies: boolean = false;
  get lf2() { return this.stage.lf2; }
  get world() { return this.stage.world; }
  readonly info: IStageObjectInfo;
  readonly entities = new Set<Entity>();
  readonly stage: Stage;
  constructor(stage: Stage, info: IStageObjectInfo) {
    this.stage = stage;
    this.info = { ...info }

    const oid = random_get(this.info.id);
    if (!oid) { debugger; return; }
    const data = this.lf2.dat_mgr.find(oid)
    if (!data) { debugger; return; }
    this.is_enemies = data.type === 'character';
  }
  add_entity(e: Entity) {
    this.entities.add(e);
    e.callbacks.add(this)
  }
  on_hp_changed(e: Entity, value: number, prev: number): void {
    if (value <= 0) setTimeout(() => e.world.del_entities(e), 500);
  }
  on_disposed(e: Entity): void {
    this.entities.delete(e);
    e.callbacks.delete(this);
    if (!this.entities.size) this.stage.handle_empty_stage_object(this)
  }
  spawn() {
    const { lf2 } = this;
    const oid = random_get(this.info.id);
    if (!oid) { return; }
    const data = lf2.dat_mgr.find(oid)
    if (!data) { return; }
    const creator = factory.get(data.type)
    if (!creator) { return; }

    const { hp, act, x, y } = this.info;
    if (this.info.times) this.info.times--;
    const e = creator(this.world, data);
    e.position.x = random_in_range(x - 100, x + 100);
    e.position.z = random_in_range(this.stage.near, this.stage.far);
    if (is_num(y)) e.position.y = y;
    if (is_num(hp)) e.hp = hp;
    if (is_str(act)) e.enter_frame(act);
    else e.enter_frame(Defines.ReservedFrameId.Auto);

    if (e instanceof Character) {
      e.team = this.stage.enemy_team;
      e.name = e.data.base.name;
      e.controller = new BotEnemyChaser(e)
    } else if (e instanceof Weapon && !is_num(y)) {
      e.position.y = 450;
    }
    this.add_entity(e);
    e.attach();
  }
  dispose() {
    for (const e of this.entities) e.callbacks.delete(this);
  }
}

export interface IStageCallbacks {
  on_phase_changed?(
    stage: Stage,
    curr: IStagePhaseInfo | undefined,
    prev: IStagePhaseInfo | undefined
  ): void;
}
export default class Stage {
  readonly callbacks = new Set<IStageCallbacks>();
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
    this._bgm_enable = this.world.lf2.stage_bgm_enable;
    if ('type' in data && data.type === 'background') {
      this.data = Defines.THE_VOID_STAGE;
      this.bg = new Background(world, data);
    } else if ('bg' in data) {
      this.data = data;
      const bg_data = this.world.lf2.dat_mgr.backgrounds.find(v => v.id === 'bg_' + this.data.bg)// FIXME;
      this.bg = new Background(world, bg_data ?? Defines.THE_VOID_BG);
    } else {
      this.data = Defines.THE_VOID_STAGE;
      this.bg = new Background(world, Defines.THE_VOID_BG);
    }
    this.enemy_team = Entity.new_team()
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
    await lf2.sound_mgr.load(music, lf2.import(music))
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
        const next_stage = this.lf2.stage_infos.find(v => v.id === next);
        if (next_stage) this.lf2.change_stage(next_stage)
      }
      return;
    }

    for (const f of this.callbacks) f.on_phase_changed?.(this, phase, old)
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