import { Warn } from "../../Log";
import type { World } from "../World";
import Callbacks from "../base/Callbacks";
import NoEmitCallbacks from "../base/NoEmitCallbacks";
import { new_team } from "../base/new_id";
import Background from "../bg/Background";
import { IBgData } from "../defines";
import { IStageInfo } from "../defines/IStageInfo";
import { IStageObjectInfo } from "../defines/IStageObjectInfo";
import { IStagePhaseInfo } from "../defines/IStagePhaseInfo";
import { Defines } from "../defines/defines";
import { is_character } from "../entity/type_check";
import { find } from "../utils/container_help/find";
import { random_in } from "../utils/math/random";
import { is_num } from "../utils/type_check";
import type IStageCallbacks from "./IStageCallbacks";
import Item from "./Item";

export default class Stage {
  readonly world: World;
  readonly data: IStageInfo;
  readonly bg: Background;
  readonly enemy_team: string;
  private _callbacks = new Callbacks<IStageCallbacks>();
  private _disposed: boolean = false;
  private _disposers: (() => void)[] = [];
  private _cur_phase_idx = -1;
  get name(): string { return this.data.name }
  get cur_phase(): number { return this._cur_phase_idx }
  get left(): number { return this.bg.left }
  get right(): number { return this.bg.right }
  get near(): number { return this.bg.near }
  get far(): number { return this.bg.far }
  get width(): number { return this.bg.width }
  get depth(): number { return this.bg.depth }
  get middle() { return this.bg.middle }
  get lf2() { return this.world.lf2 }
  get callbacks(): NoEmitCallbacks<IStageCallbacks> {
    return this._callbacks
  }

  /**
   * 玩家角色的地图左边界
   *
   * @readonly
   * @type {number}
   */
  get player_left(): number { return this.bg.left }

  /**
   * 玩家角色的地图右边界
   *
   * @readonly
   * @type {number}
   */
  get player_right(): number { return this.data.phases[this._cur_phase_idx]?.bound ?? this.bg.right }

  constructor(world: World, data: IStageInfo | IBgData) {
    this.world = world;
    if ('type' in data && data.type === 'background') {
      this.data = Defines.VOID_STAGE;
      this.bg = new Background(world, data);
    } else if ('bg' in data) {
      this.data = data;
      const bg_id = this.data.bg
      const bg_data = this.world.lf2.datas.backgrounds.find(v => v.id === bg_id || v.id === 'bg_' + bg_id)// FIXME;
      if (!bg_data) Warn.print(Stage.name, `bg_data not found, id: ${bg_id}`)
      this.bg = new Background(world, bg_data ?? Defines.VOID_BG);
    } else {
      this.data = Defines.VOID_STAGE;
      this.bg = new Background(world, Defines.VOID_BG);
    }
    this.enemy_team = new_team()
    this.enter_phase(0);
  }

  private _stop_bgm?: () => void;

  private async play_phase_bgm() {
    const phase_info = this.data.phases[this._cur_phase_idx]
    if (!phase_info) return;
    const { lf2 } = this;
    const { music } = phase_info;
    if (!music) return;
    if (!lf2.sounds.has(music))
      await lf2.sounds.load(music, music)
    if (this._disposed) return;
    this._stop_bgm = lf2.sounds.play_bgm(music);
  }

  stop_bgm(): void {
    this._stop_bgm?.();
  }

  enter_phase(idx: number) {

    if (this._cur_phase_idx === idx) return;

    const old: IStagePhaseInfo | undefined = this.data.phases[this._cur_phase_idx]
    const phase: IStagePhaseInfo | undefined = this.data.phases[this._cur_phase_idx = idx]

    this._callbacks.emit('on_phase_changed')(this, phase, old);
    if (!phase) return;
    const { objects } = phase;
    this.play_phase_bgm()
    for (const object of objects) {
      this.spawn_object(object);
    }
    if (is_num(phase.cam_jump_to_x)) {
      this.world.camera.position.x = phase.cam_jump_to_x;
    }
    if (is_num(phase.player_jump_to_x)) {
      const x = phase.player_jump_to_x;
      for (const [, p] of this.world.player_characters) {
        p.position.x = random_in(x - 50, x + 50);
      }
    }
  }
  enter_next_phase(): void {
    if (!this.is_last_phase()) {
      this.enter_phase(this._cur_phase_idx + 1);
      return;
    }
    this.lf2.goto_next_stage()
  }

  readonly items = new Set<Item>();
  async spawn_object(obj_info: IStageObjectInfo) {
    let count = 0;
    for (const [, c] of this.world.player_characters)
      count += c.data.base.ce ?? 1;
    if (!count) count = 1;
    
    const { ratio = 1, times = 1 } = obj_info;
    let spawn_count = Math.floor(count * ratio);
    if (spawn_count <= 0 || !times) return;

    while ((--spawn_count) >= 0) {
      const stage_object = new Item(this, obj_info);
      stage_object.spawn();
      this.items.add(stage_object)

    }
  }
  kill_all_enemies() {
    for (const o of this.items) {
      if (!o.is_enemies) continue;
      for (const e of o.entities) {
        if (is_character(e)) e.hp = 0;
      }
    }
  }
  kill_soliders() {
    for (const o of this.items) {
      if (!o.is_enemies) continue;
      if (!o.info.is_soldier) continue;
      for (const e of o.entities) {
        if (is_character(e)) e.hp = 0;
      }
    }
  }
  kill_boss() {
    for (const o of this.items) {
      if (!o.is_enemies) continue;
      if (!o.info.is_boss) continue;
      for (const e of o.entities) {
        if (is_character(e)) e.hp = 0;
      }
    }
  }
  kill_others() {
    for (const o of this.items) {
      if (!o.is_enemies) continue;
      if (o.info.is_boss || o.info.is_soldier) continue;
      for (const e of o.entities) {
        if (is_character(e)) e.hp = 0;
      }
    }
  }
  dispose() {
    this._disposed = true;
    for (const f of this._disposers) f();
    this.bg.dispose();
    for (const so of this.items) {
      so.dispose();
    }
  }
  all_boss_dead(): boolean {
    return !find(this.items, i => i.info.is_boss)
  }
  all_enemies_dead(): boolean {
    return !find(this.items, i => i.is_enemies)
  }
  is_last_phase(): boolean {
    return this._cur_phase_idx >= this.data.phases.length - 1;
  }
  handle_empty_stage_object(stage_object: Item) {
    const { times, is_soldier } = stage_object.info;
    if (is_soldier) {
      if (this.all_boss_dead()) {
        this.items.delete(stage_object);
        stage_object.dispose();
      } else if (!is_num(times) || times > 0) {
        stage_object.spawn();
      }
    } else if (times) {
      stage_object.spawn();
    } else {
      this.items.delete(stage_object);
      stage_object.dispose();
    }
    if (this.all_enemies_dead()) {
      this.enter_phase(this._cur_phase_idx + 1);
    }
  }
}
