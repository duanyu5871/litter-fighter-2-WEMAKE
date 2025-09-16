import type { World } from "../World";
import Callbacks from "../base/Callbacks";
import FSM from "../base/FSM";
import { new_team } from "../base/new_id";
import Background from "../bg/Background";
import { Defines, EntityEnum, IBgData, IStageInfo, IStageObjectInfo, IStagePhaseInfo } from "../defines";
import { Ditto } from "../ditto";
import { Entity } from "../entity/Entity";
import { is_character, is_weapon } from "../entity/type_check";
import { floor } from "../utils";
import { find } from "../utils/container_help/find";
import { is_num } from "../utils/type_check";
import type IStageCallbacks from "./IStageCallbacks";
import Item from "./Item";
import { Status } from "./Status";

export class Stage implements Readonly<Omit<IStageInfo, 'bg'>> {
  static readonly TAG: string = "Stage";
  readonly world: World;
  readonly data: IStageInfo;
  readonly next_stage?: IStageInfo;
  readonly bg: Background;
  readonly team: string;
  readonly callbacks = new Callbacks<IStageCallbacks>();
  private _disposed: boolean = false;
  private _disposers: (() => void)[] = [];
  private _cur_phase_idx = -1;
  get phases() { return this.data.phases }
  get id(): string { return this.data.name; }
  get name(): string { return this.data.name; }
  get cur_phase(): number { return this._cur_phase_idx; }
  get left(): number { return this.bg.left; }
  get right(): number { return this.bg.right; }
  get near(): number { return this.bg.near; }
  get far(): number { return this.bg.far; }
  get width(): number { return this.bg.width; }
  get depth(): number { return this.bg.depth; }
  get middle() { return this.bg.middle; }
  get lf2() { return this.world.lf2; }
  get time() { return this.fsm.time; }

  /**
   * 玩家角色的地图左边界
   *
   * @readonly
   * @type {number}
   */
  get player_left(): number {
    return this.bg.left;
  }

  get camera_left(): number {
    return this.bg.left;
  }

  /**
   * 玩家角色的地图右边界
   *
   * @readonly
   * @type {number}
   */
  get player_right(): number {
    return this.data.phases[this._cur_phase_idx]?.bound ?? this.bg.right;
  }
  get camera_right(): number {
    if (!this.data.phases.length) return this.bg.right
    const { phases } = this.data
    const phase = phases[this._cur_phase_idx] || phases[phases.length - 1]!
    return phase.bound ?? this.bg.right;
  }
  constructor(world: World, data: IStageInfo | IBgData) {
    this.world = world;
    if ("type" in data && data.type === "background") {
      this.data = Defines.VOID_STAGE;
      this.bg = new Background(world, data);
    } else if ("bg" in data) {
      this.data = data;
      const bg_id = this.data.bg;
      const bg_data = this.world.lf2.datas.backgrounds.find(
        (v) => v.id === bg_id || v.id === "bg_" + bg_id,
      ); // FIXME;
      if (!bg_data && bg_id !== Defines.VOID_BG.id)
        Ditto.warn(Stage.TAG + "::constructor", `bg_data not found, id: ${bg_id}`);
      this.bg = new Background(world, bg_data ?? Defines.VOID_BG);
    } else {
      this.data = Defines.VOID_STAGE;
      this.bg = new Background(world, Defines.VOID_BG);
    }
    if (this.data.next)
      this.next_stage = this.lf2.stages.find(v => v.id === this.data.next);
    this.team = new_team();
  }

  readonly fsm = new FSM<Status>().add({
    key: Status.Running,
    update: () => {
      if (this.is_stage_finish) return Status.Completed;
    }
  }, {
    key: Status.Completed,
    enter: () => {
      this.callbacks.emit('on_stage_finish')(this)
      if (this.is_chapter_finish) this.callbacks.emit('on_chapter_finish')(this)
    },
    update: () => {
      if (this.should_goto_next_stage) {
        this.callbacks.emit('on_requrie_goto_next_stage')(this)
        return Status.End;
      }
    }
  }, {
    key: Status.End
  }).use(Status.Running)

  private _stop_bgm?: () => void;

  private async play_phase_bgm() {
    const phase_info = this.data.phases[this._cur_phase_idx];
    if (!phase_info) return;
    const { lf2 } = this;
    const { music } = phase_info;
    if (!music) return;
    if (!lf2.sounds.has(music)) await lf2.sounds.load(music, music);
    if (this._disposed) return;
    this._stop_bgm = lf2.sounds.play_bgm(music);
  }

  stop_bgm(): void {
    this._stop_bgm?.();
  }

  enter_phase(idx: number) {
    if (this._cur_phase_idx === idx) return;
    const old: IStagePhaseInfo | undefined =
      this.data.phases[this._cur_phase_idx];
    const phase: IStagePhaseInfo | undefined =
      this.data.phases[(this._cur_phase_idx = idx)];
    this.callbacks.emit("on_phase_changed")(this, phase, old);
    if (!phase) return;
    const { objects, respawn, health_up } = phase;

    if (health_up && health_up > 0) {
      for (const [, f] of this.world.slot_fighters) {
        if (f.hp <= 0) continue;
        const hp = f.hp_r + (f.hp_max - f.hp_r) * health_up
        f.hp = f.hp_r = hp
      }
    }
    if (respawn && respawn > 0) {
      for (const [, f] of this.world.slot_fighters) {
        if (f.hp > 0) continue;
        f.hp = f.hp_r = f.hp_max * respawn
      }
    }

    this.play_phase_bgm();
    for (const object of objects) {
      this.spawn_object(object);
    }
    if (is_num(phase.cam_jump_to_x)) {
      this.world.renderer.cam_x = phase.cam_jump_to_x;
    }

    if (is_num(phase.player_jump_to_x)) {
      const x = phase.player_jump_to_x;

      const player_teams = new Set<string>();
      for (const [, v] of this.lf2.world.slot_fighters) {
        player_teams.add(v.team);
      }
      for (const entity of this.world.entities) {
        if (is_character(entity) && player_teams.has(entity.team))
          entity.position.x = this.lf2.random_in(x, x + 50);
      }
    }
  }
  enter_next_phase(): void {
    this.enter_phase(this._cur_phase_idx + 1);
  }

  readonly items = new Set<Item>();
  async spawn_object(obj_info: IStageObjectInfo) {

    let count = 0;

    for (const [, c] of this.world.slot_fighters)
      count += c.data.base.ce ?? 1;
    if (!count) count = 1;

    const { ratio, times = 1 } = obj_info;

    let spawn_count = ratio === void 0 ? 1 : floor(count * ratio);
    if (spawn_count <= 0 || !times) return;

    while (spawn_count > 0) {
      const stage_object = new Item(this, obj_info);
      stage_object.spawn();
      this.items.add(stage_object);
      --spawn_count;
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
    for (const item of this.items) item.dispose();

    const temp: Entity[] = [];
    const player_teams = new Set<string>();
    for (const [, v] of this.lf2.world.slot_fighters) {
      player_teams.add(v.team);
    }
    for (const e of this.world.entities) {
      if (is_character(e) && player_teams.has(e.team)) continue;
      else if (is_weapon(e) && e.holder && player_teams.has(e.holder.team))
        continue;
      temp.push(e);
    }
    this.world.del_entities(temp);
    this.callbacks.clear()
  }
  all_boss_dead(): boolean {
    return !find(this.items, (i) => i.info.is_boss);
  }
  all_enemies_dead(): boolean {
    return !find(this.items, (i) => i.is_enemies);
  }
  handle_empty_stage_item(item: Item) {
    const { times, is_soldier } = item.info;
    if (is_soldier) {
      if (this.all_boss_dead()) {
        this.items.delete(item);
        item.dispose();
      } else if (!is_num(times) || times > 0) {
        item.spawn();
      }
    } else if (times) {
      item.spawn();
    } else {
      this.items.delete(item);
      item.dispose();
    }
    if (this.all_enemies_dead()) {
      this.enter_phase(this._cur_phase_idx + 1);
    }
  }

  /** 章是否结束 */
  get is_chapter_finish(): boolean {
    if (!this.is_stage_finish) return false
    if (!this.next_stage) return true;
    return this.next_stage.chapter !== this.data.chapter
  }
  /** 节是否结束 */
  get is_stage_finish(): boolean {
    const l = this.phases.length
    return !!l && this._cur_phase_idx >= l;
  }
  /** 是否应该进入下一关 */
  get should_goto_next_stage(): boolean {
    if (!this.next_stage) return false;
    if (this.next_stage.chapter === this.data.chapter) {
      return !find(this.world.entities, e => is_character(e) && e.hp > 0 && e.position.x < this.camera_right)
    }
    return false;
  }

  update() {
    this.fsm.update(1);
  }
}
