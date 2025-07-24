import { IOrthographicCameraNode, IScene } from "./3d";
import { Callbacks, FPS, ICollision } from "./base";
import { Builtin_FrameId, Defines, IBdyInfo, IBounding, IEntityData, IFrameInfo, IItrInfo, StateEnum } from "./defines";
import { AllyFlag } from "./defines/AllyFlag";
import Ditto from "./ditto";
import { IWorldRenderer } from "./ditto/render/IWorldRenderer";
import {
  Entity, Factory, ICreator, is_ball,
  is_base_ctrl,
  is_character,
  is_local_ctrl,
  is_weapon
} from "./entity";
import { IWorldCallbacks } from "./IWorldCallbacks";
import LF2 from "./LF2";
import { Stage } from "./stage/Stage";
import { WhatNext } from "./state/State_Base";
import { find } from "./utils/container_help";
import { is_num } from "./utils/type_check";
import { WorldDataset } from "./WorldDataset";
export class World extends WorldDataset {
  static override readonly TAG: string = "World";
  readonly lf2: LF2;
  readonly callbacks = new Callbacks<IWorldCallbacks>();

  private _spark_data?: IEntityData;
  private _spark_creator?: ICreator<Entity, typeof Entity>;
  private _stage: Stage;
  private _need_FPS: boolean = true;
  private _need_UPS: boolean = true;
  private _FPS = new FPS(0.9);
  private _UPS = new FPS(0.9);
  private _render_worker_id?: ReturnType<typeof Ditto.Render.add>;
  private _update_worker_id?: ReturnType<typeof Ditto.Interval.add>;
  entities = new Set<Entity>();
  readonly player_slot_characters = new Map<string, Entity>();
  get stage() {
    return this._stage;
  }
  set stage(v) {
    if (v === this._stage) return;
    const o = this._stage;
    this._stage = v;
    this.callbacks.emit("on_stage_change")(v, o);
    o.dispose();
    v.enter_phase(0);
  }
  override on_dataset_change = (k: string, curr: any, prev: any) => {
    this.callbacks.emit('on_dataset_change')(k as any, curr, prev, this)
  };
  on_sync_render_change(curr: any, prev: any) {
    this.callbacks.emit('on_sync_render_changed')(curr, prev)
    this.start_render();
    this.start_update();
  }
  get bg() {
    return this._stage.bg;
  }
  get left() {
    return this.bg.left || 0;
  }
  get right() {
    return this.bg.right || 0;
  }
  get near() {
    return this.bg.near || 0;
  }
  get far() {
    return this.bg.far || 0;
  }
  get width() {
    return this.bg.width || 0;
  }
  get depth() {
    return this.bg.depth || 0;
  }
  get middle() {
    return this.bg.middle || { x: 0, z: 0 };
  }

  cam_speed = 0;
  lock_cam_x: number | undefined = void 0;
  public renderer: IWorldRenderer
  get scene(): IScene { return this.renderer.scene }
  get camera(): IOrthographicCameraNode { return this.renderer.camera }

  constructor(lf2: LF2) {
    super()
    this.lf2 = lf2;
    this._stage = new Stage(this, Defines.VOID_BG);
    this.renderer = new Ditto.WorldRender(this);
  }

  add_entities(...entities: Entity[]) {
    for (const entity of entities) {
      if (
        is_character(entity) &&
        is_base_ctrl(entity.ctrl) &&
        this.lf2.players.has(entity.ctrl.player_id)
      ) {
        this.player_slot_characters.set(entity.ctrl.player_id, entity);
        this.callbacks.emit("on_player_character_add")(
          entity.ctrl.player_id,
        );
      }

      this.entities.add(entity);
      this.renderer.add_entity(entity);
    }
  }

  del_entity(e: Entity) {
    if (!this.entities.delete(e)) return false;
    if (e.ctrl?.player_id) {
      const ok = this.player_slot_characters.delete(e.ctrl.player_id);
      if (ok)
        this.callbacks.emit("on_player_character_del")(e.ctrl.player_id);
    }
    this.renderer.del_entity(e);
    e.dispose();
    return true;
  }

  del_entities(entities: Entity[]) {
    for (const e of entities) {
      this.del_entity(e);
    }
  }

  stop_render() {
    this._render_worker_id && Ditto.Render.del(this._render_worker_id);
    this._render_worker_id = 0;
  }

  start_render() {
    if (this._render_worker_id) Ditto.Render.del(this._render_worker_id);
    if (this.sync_render) return;
    let _r_prev_time = 0;
    const on_render = (time: number) => {
      const dt = time - _r_prev_time;
      if (_r_prev_time !== 0) {
        this.render_once(dt);
      }
      if (_r_prev_time !== 0 && this._need_FPS) {
        this._FPS.update(dt);
        this.callbacks.emit("on_fps_update")(this._FPS.value);
      }
      _r_prev_time = time;
    };
    this._render_worker_id && Ditto.Render.del(this._render_worker_id);
    this._render_worker_id = Ditto.Render.add(on_render);
  }

  stop_update() {
    this._update_worker_id && Ditto.Interval.del(this._update_worker_id);
    this._update_worker_id = void 0;
  }
  start_update() {
    if (this._update_worker_id) Ditto.Interval.del(this._update_worker_id);
    let _prev_time = Date.now();
    let _update_count = 0;
    let _fix_radio = 1;
    const on_update = () => {
      const time = Date.now();
      const real_dt = time - _prev_time;
      this.lf2.ui?.update(real_dt);
      if (real_dt < this._ideally_dt * _fix_radio) return;
      _update_count++;
      if (!this._paused) this.update_once();
      this.update_camera();
      this.bg.update();

      if (0 === _update_count % this.sync_render) {
        this.render_once(real_dt);
        this.callbacks.emit("on_fps_update")(this._UPS.value / this.sync_render);
      }
      this._UPS.update(real_dt);
      _fix_radio = this._UPS.value / 60;
      if (this._need_UPS) {
        this.callbacks.emit("on_ups_update")(this._UPS.value, 0);
      }
      _prev_time = time;
    };
    this._update_worker_id = Ditto.Interval.add(on_update, 0);
  }

  /**
   * 限制角色位置
   * 
   * @param {Entity} e 角色实体
   * @return {void} 
   * @memberof World
   */
  restrict_character(e: Entity): void {
    if (!this.bg) return;
    const { left, right, near, far, player_left, player_right } = this.stage;

    const is_player = is_local_ctrl(e.ctrl);
    const l = is_player ? player_left : left;
    const r = is_player ? player_right : right;

    const { x, z } = e.position;
    if (x < l) e.position.x = l;
    else if (x > r) e.position.x = r;

    if (z < far) e.position.z = far;
    else if (z > near) e.position.z = near;
  }

  /**
   * 限制“波”位置
   *
   * 当“波”离开地图太远，直接标记为移除
   * 
   * @param {Entity} e “波”
   * @return {void}
   * @memberof World
   */
  restrict_ball(e: Entity): void {
    if (!this.bg) return;
    const { left, right, near, far } = this.bg.data.base;
    const { x, z } = e.position;
    if (x < left - 800) e.enter_frame(Defines.NEXT_FRAME_GONE);
    else if (x > right + 800) e.enter_frame(Defines.NEXT_FRAME_GONE);
    if (z < far) e.position.z = far;
    else if (z > near) e.position.z = near;
  }

  /**
   * 限制“武器”位置
   *
   * 当“武器”离开地图太远，直接标记为移除
   * 
   * @param {Entity} e “武器”
   * @return {void}
   * @memberof World
   */
  restrict_weapon(e: Entity): void {
    if (!this.bg) return;
    const { left, right, near, far } = this.bg.data.base;
    const { x, z } = e.position;
    if (x < left - 100) e.enter_frame(Defines.NEXT_FRAME_GONE);
    else if (x > right + 100) e.enter_frame(Defines.NEXT_FRAME_GONE);
    if (z < far) e.position.z = far;
    else if (z > near) e.position.z = near;
  }

  /**
   * 限制“实体”位置
   *
   * @param {Entity} e
   * @memberof World
   */
  restrict(e: Entity): void {
    if (is_character(e)) {
      this.restrict_character(e);
    } else if (is_ball(e)) {
      this.restrict_ball(e);
    } else if (is_weapon(e)) {
      this.restrict_weapon(e);
    }
  }

  manhattan(e1: Entity, e2: Entity) {
    const p1 = e1.position;
    const p2 = e2.position;
    return Math.abs(p1.x - p2.x) + Math.abs(p1.z - p2.z);
  }

  private gone_entities: Entity[] = [];
  private _entity_chasers = new Set<Entity>();
  add_entity_chaser(entity: Entity) {
    this._entity_chasers.add(entity);
  }
  del_entity_chaser(entity: Entity) {
    this._entity_chasers.delete(entity);
    entity.chasing_target = void 0;
  }
  update_once() {
    for (const e of this.entities) {
      e.self_update();

      if (e.chasing_target && !e.chasing_target.ctrl) {
        e.chasing_target = void 0;
      }

      for (const chaser of this._entity_chasers) {
        if (!is_character(e) || chaser.is_ally(e) || e.hp <= 0)
          continue;
        const prev = chaser.chasing_target;
        if (!prev || this.manhattan(prev, chaser) > this.manhattan(e, chaser)) {
          chaser.chasing_target = e;
        }
      }
    }
    this.gone_entities.length = 0;
    for (const e of this.entities) {
      e.update();
      if (
        e.frame.id === Builtin_FrameId.Gone ||
        e.frame.state === StateEnum.Gone
      ) {
        this.gone_entities.push(e);
      }
    }
    this.del_entities(this.gone_entities);
    this.collision_detections();
    this.stage.update();
  }

  render_once(dt: number) {
    this.renderer.render();
  }

  update_camera() {
    const old_cam_x = Math.floor(this.renderer.cam_x);
    const { player_left, left, player_right, right } = this.stage;
    const max_cam_left = is_num(this.lock_cam_x) ? left : player_left;
    const max_cam_right = is_num(this.lock_cam_x) ? right : player_right;
    let new_x = this.renderer.cam_x;
    let max_speed_ratio = 50;
    let acc_ratio = 1;
    if (is_num(this.lock_cam_x)) {
      new_x = this.lock_cam_x;
      max_speed_ratio = 1000;
      acc_ratio = 10;
    } else if (this.player_slot_characters.size) {
      let l = 0;
      new_x = 0;
      const has_human_player = find(
        this.player_slot_characters,
        ([_, p]) => is_local_ctrl(p.ctrl) && p.hp > 0,
      );
      for (const [, player] of this.player_slot_characters) {
        const c = player.ctrl;
        if (!is_local_ctrl(c) && has_human_player) continue;
        new_x += player.position.x - 794 / 2 + (player.facing * 794) / 6;
        ++l;
      }
      new_x = Math.floor(new_x / l);
    }
    if (new_x < max_cam_left) new_x = max_cam_left;
    if (new_x > max_cam_right - this.screen_w) new_x = max_cam_right - this.screen_w;
    let cur_x = this.renderer.cam_x;
    const acc = Math.min(
      acc_ratio,
      (acc_ratio * Math.abs(cur_x - new_x)) / this.screen_w,
    );
    const max_speed = max_speed_ratio * acc;

    if (cur_x > new_x) {
      if (this.cam_speed > 0) this.cam_speed = 0;
      else if (this.cam_speed > -max_speed) this.cam_speed -= acc;
      else this.cam_speed = -max_speed;
      this.renderer.cam_x += this.cam_speed;
      if (this.renderer.cam_x < new_x) this.renderer.cam_x = new_x;
    } else if (cur_x < new_x) {
      if (this.cam_speed < 0) this.cam_speed = 0;
      else if (this.cam_speed < max_speed) this.cam_speed += acc;
      else this.cam_speed = max_speed;
      this.renderer.cam_x += this.cam_speed;
      if (this.renderer.cam_x > new_x) this.renderer.cam_x = new_x;
    }

    const new_cam_x = Math.floor(this.renderer.cam_x);
    if (old_cam_x !== new_cam_x) {
      this.callbacks.emit("on_cam_move")(new_cam_x);
    }
  }

  private _temp_entitis_set = new Set<Entity>();
  collision_detections() {
    this._temp_entitis_set.clear();
    for (const a of this.entities) {
      for (const b of this._temp_entitis_set) {
        this.collision_detection(a, b);
        this.collision_detection(b, a);
      }
      this._temp_entitis_set.add(a);
    }
  }

  collision_detection(a: Entity, b: Entity) {
    if (b.blinking || b.invisible) return;
    const af = a.frame;
    const bf = b.frame;
    if (!af.itr?.length || !bf.bdy?.length) return;
    const b_catcher = b.catcher;
    if (b_catcher && b_catcher.frame.cpoint?.hurtable !== 1) return;
    const l0 = af.itr.length;
    const l1 = bf.bdy.length;
    for (let i = 0; i < l0; ++i) {
      for (let j = 0; j < l1; ++j) {
        this.collision_test(a, af, af.itr[i]!, b, bf, bf.bdy[j]!);
      }
    }
  }

  collision_test(
    attacker: Entity,
    aframe: IFrameInfo,
    itr: IItrInfo,
    victim: Entity,
    bframe: IFrameInfo,
    bdy: IBdyInfo,
  ): void {
    switch (aframe.state) {
      case StateEnum.Weapon_OnHand: {
        const atk = attacker.holder?.frame.wpoint?.attacking;
        if (!atk) return;
        const itr_prefab = attacker.data.itr_prefabs?.[atk];
        if (!itr_prefab) return;
        itr = { ...itr, ...itr_prefab };
        break;
      }
      case StateEnum.Weapon_Rebounding: {
        return;
      }
    }

    const a_cube = this.get_bounding(attacker, aframe, itr);
    const b_cube = this.get_bounding(victim, bframe, bdy);
    if (!(
      a_cube.left <= b_cube.right &&
      a_cube.right >= b_cube.left &&
      a_cube.bottom <= b_cube.top &&
      a_cube.top >= b_cube.bottom &&
      a_cube.far <= b_cube.near &&
      a_cube.near >= b_cube.far
    )) return;

    const is_ally = attacker.is_ally(victim);
    if (
      is_ally ? (
        !(itr.ally_flags & AllyFlag.Ally) &&
        !(bdy.ally_flags & AllyFlag.Ally)
      ) : (
        !(itr.ally_flags & AllyFlag.Enemy) &&
        !(bdy.ally_flags & AllyFlag.Enemy)
      )
    ) return;

    if (!itr.vrest && attacker.a_rest) return;
    if (itr.vrest && victim.get_v_rest(attacker.id) > 0) return;

    const collision: ICollision = {
      v_rest: !itr.arest && itr.vrest ? itr.vrest + this.vrest_offset : void 0,
      victim,
      attacker,
      itr,
      bdy,
      aframe,
      bframe,
      a_cube,
      b_cube,
    };
    if (
      bdy.tester?.run(collision) === false ||
      itr.tester?.run(collision) === false
    ) return;

    const a = attacker.state?.before_collision?.(collision);
    const b = victim.state?.before_be_collided?.(collision);

    switch (a) {
      case WhatNext.SkipAll:
        break;
      case WhatNext.OnlyState: {
        attacker.state?.on_collision?.(collision);
        break;
      }
      case WhatNext.OnlyEntity: {
        attacker.on_collision(collision);
        break;
      }
      case WhatNext.Continue:
      default: {
        attacker.on_collision(collision);
        attacker.state?.on_collision?.(collision);
        break;
      }
    }
    switch (b) {
      case WhatNext.SkipAll:
        break;
      case WhatNext.OnlyState: {
        victim.state?.on_be_collided?.(collision);
        break;
      }
      case WhatNext.OnlyEntity: {
        victim.on_be_collided(collision);
        break;
      }
      case WhatNext.Continue:
      default: {
        victim.on_be_collided(collision);
        victim.state?.on_be_collided?.(collision);
        break;
      }
    }
  }

  init_spark_data() {
    this._spark_data = this.lf2.datas.find(Defines.BuiltIn_Dats.Spark);
    this._spark_creator = this._spark_data ? Factory.inst.get_entity_creator(this._spark_data.type) : void 0;
  }

  /**
   * 火花特效
   *
   * @param {number} x x坐标
   * @param {number} y y坐标
   * @param {number} z z坐标
   * @param {string} f 帧ID
   * @return {void}
   * @memberof World
   */
  spark(x: number, y: number, z: number, f: string): void {
    if (!this._spark_data)
      this.init_spark_data();
    if (!this._spark_data) {
      Ditto.Warn(
        World.TAG + "::spark",
        `data of "${Defines.BuiltIn_Dats.Spark}" not found!`,
      );
      return;
    }
    if (!this._spark_creator) {
      Ditto.Warn(World.TAG + "::spark", `creator of "${this._spark_data.type}" not found!`);
      return;
    }
    const e = this._spark_creator(this, this._spark_data);
    e.position.set(Math.round(x), Math.round(y), Math.round(z));
    e.enter_frame({ id: f });
    e.attach();
  }

  get_bounding(e: Entity, f: IFrameInfo, i: IItrInfo | IBdyInfo): IBounding {
    const left =
      e.facing > 0
        ? e.position.x - f.centerx + i.x
        : e.position.x + f.centerx - i.x - i.w;
    const top = e.position.y + f.centery - i.y;
    const far = e.position.z + i.z;
    return {
      left,
      right: left + i.w,
      top,
      bottom: top - i.h,
      far,
      near: far + i.l,
    };
  }

  private _ideally_dt: number = Math.floor(1000 / 60);
  private _playrate: number = 1;

  get playrate() {
    return this._playrate;
  }
  set playrate(v: number) {
    if (v <= 0) throw new Error("playrate must be larger than 0");
    if (v === this._playrate) return;
    this._playrate = v;
    this._ideally_dt = Math.floor(1000 / 60) / this._playrate;
    this.start_update();
  }

  private _paused = false;
  get paused() { return this._paused; }
  set paused(v: boolean) { this.set_paused(v); }
  indicator_flags: number = 0;

  set_paused(v: boolean) {
    if (this._paused === v) return;
    this._paused = v;
    this.callbacks.emit("on_pause_change")(v);
  }

  dispose() {
    this.callbacks.emit("on_disposed")();
    this.stop_update();
    this.stop_render();
    this.del_entities(Array.from(this.entities));
    this.renderer.dispose();
    this.callbacks.clear()
  }
}