import { Warn } from '../Log';
import { IOrthographicCameraNode } from './3d/IOrthographicCamera';
import { ISceneNode } from './3d/ISceneNode';
import { IWorldCallbacks } from './IWorldCallbacks';
import LF2 from './LF2';
import Callbacks from './base/Callbacks';
import FPS from './base/FPS';
import { NoEmitCallbacks } from "./base/NoEmitCallbacks";
import { BaseController } from './controller/BaseController';
import LocalController from './controller/LocalController';
import { IBdyInfo, IFrameInfo, IItrInfo } from './defines';
import { Defines } from './defines/defines';
import Ditto from './ditto';
import Ball from './entity/Ball';
import Character from './entity/Character';
import Entity from './entity/Entity';
import { Factory } from './entity/Factory';
import Weapon from './entity/Weapon';
import { is_ball, is_character, is_weapon } from './entity/type_check';
import { EntityRender } from './renderer/EntityRender';
import Stage from './stage/Stage';
import float_equal from './utils/math/float_equal';
import { is_num } from './utils/type_check';
export interface ICube {
  left: number;
  right: number;
  top: number;
  bottom: number;
  near: number;
  far: number;
}
export class World {
  static readonly TAG = 'World';
  readonly lf2: LF2
  readonly _callbacks = new Callbacks<IWorldCallbacks>();

  get callbacks(): NoEmitCallbacks<IWorldCallbacks> {
    return this._callbacks
  }

  /**
   * 按键“双击”判定间隔，单位（帧数）
   * 
   * 当同个按键在“双击判定间隔”之内按下两次，
   * 且中途未按下其对应冲突按键，视为“双击”。
   * 
   */
  double_click_interval = Defines.DOUBLE_CLICK_INTERVAL;

  /** 
   * 按键“按下”/“双击”的判定持续帧，单位：帧数
   * 
   * 当某按键被“按下”（不松开），接下来的数帧（数值key_hit_duration）内，均判定为“按下”。
   * 此时若存在对应的“按键‘按下’跳转动作”，且满足跳转条件，角色将会进入对应的“按键‘按下’跳转动作”。
   * 
   * 当某双击后，接下来的数帧（数值key_hit_duration）内，均判定为“双击”。
   * 此时若存在对应的“按键‘双击’跳转动作”，且满足跳转条件，角色将会进入对应的“按键‘双击’跳转动作”。
   */
  key_hit_duration = Defines.KEY_HIT_DURATION

  protected _gravity = Defines.GRAVITY;

  friction_factor = Defines.FRICTION_FACTOR;
  friction = Defines.FRICTION;
  scene: ISceneNode;
  camera: IOrthographicCameraNode;

  private _stage: Stage;
  entities = new Set<Entity>();
  disposed = false;

  readonly player_slot_characters = new Map<string, Character>();
  readonly nearest_enemy_requesters = new Set<Entity>();

  get stage() { return this._stage }
  set stage(v) {
    if (v === this._stage) return;
    const old = this._stage;
    this._stage = v;
    this._callbacks.emit('on_stage_change')(v, old);
    old.dispose();
  }

  get bg() { return this._stage.bg }

  get left() { return this.bg.left || 0 }
  get right() { return this.bg.right || 0 }
  get near() { return this.bg.near || 0 }
  get far() { return this.bg.far || 0 }
  get width() { return this.bg.width || 0 }
  get depth() { return this.bg.depth || 0 };
  get middle() { return this.bg.middle || { x: 0, z: 0 } }

  protected _screen_w: number = Defines.OLD_SCREEN_WIDTH;
  protected _screen_h: number = Defines.OLD_SCREEN_HEIGHT;

  get screen_w(): number { return this._screen_w; }
  get screen_h(): number { return this._screen_h; }
  get gravity(): number { return this._gravity; }
  set gravity(v: number) { this.set_gravity(v); }
  set_gravity(v: number) {
    const prev = this._gravity
    if (float_equal(v, prev)) return;
    this._gravity = v;
    this._callbacks.emit('on_gravity_change')(v, prev, this)
  }
  constructor(lf2: LF2, canvas: HTMLCanvasElement) {
    this.lf2 = lf2;
    const w = this._screen_w = Defines.OLD_SCREEN_WIDTH;
    const h = this._screen_h = 450;// Defines.OLD_SCREEN_HEIGHT;

    this.scene = new Ditto.SceneNode(lf2, canvas).set_size(w * 4, h * 4);
    this.camera = new Ditto.OrthographicCamera(lf2)
      .setup(0, w, h, 0)
      .set_position(void 0, void 0, 10)
      .set_name("default_orthographic_camera")
      .apply()
    this.scene.add(this.camera);
    this._stage = new Stage(this, Defines.VOID_BG);
  }

  entity_renders = new Map<Entity, EntityRender>();

  add_entities(...entities: Entity[]) {
    for (const entity of entities) {
      if (is_character(entity) && BaseController.is(entity.controller) && this.lf2.player_infos.has(entity.controller.player_id)) {
        this.player_slot_characters.set(entity.controller.player_id, entity);
        this._callbacks.emit('on_player_character_add')(entity.controller.player_id)
      }

      this.entities.add(entity)
      const render = new EntityRender(entity).set_entity(entity);
      render.attach()
      this.entity_renders.set(entity, render);
      render.indicators.show = this._show_indicators;
    }
  }

  del_entities(...objs: Entity[]) {
    for (const e of objs) {
      if (is_character(e) && LocalController.is(e.controller)) {
        this.player_slot_characters.delete(e.controller.player_id);
        this._callbacks.emit('on_player_character_del')(e.controller.player_id)
      }
      const r = this.entity_renders.get(e);
      if (r) {
        r.dispose();
        this.entity_renders.delete(e);
      }

      this.entities.delete(e);
      e.dispose();
    }
  }

  private _need_FPS: boolean = true;
  private _need_UPS: boolean = true;
  private _FPS = new FPS()
  private _UPS = new FPS();
  private _render_worker_id?: ReturnType<typeof Ditto.Render.add>;
  private _update_worker_id?: ReturnType<typeof Ditto.Interval.add>;

  private _sync_render: 0 | 1 | 2 = 0;
  get sync_render(): number {
    return this._sync_render
  }
  set sync_render(v: number) {
    this.set_sync_render(v)
  }
  set_sync_render(v: number = this._sync_render + 1) {
    if (this._sync_render === v) return;
    const prev = this._sync_render
    const curr = this._sync_render = Math.floor(v) % 3 as 0 | 1 | 2;
    this.start_render();
    this.start_update();
    this._callbacks.emit('on_is_sync_render_changed')(curr, prev)
  }
  stop_render() {
    this._render_worker_id && Ditto.Render.del(this._render_worker_id);
    this._render_worker_id = 0;
  }

  start_render() {
    if (this.disposed) return;
    if (this._render_worker_id) Ditto.Render.del(this._render_worker_id);
    if (this._sync_render) return;
    let _r_prev_time = 0;
    const on_render = (time: number) => {
      const dt = time - _r_prev_time
      if (_r_prev_time !== 0) {
        this.render_once(dt)
      }
      if (_r_prev_time !== 0 && this._need_FPS) {
        this._FPS.update(dt);
        this._callbacks.emit('on_fps_update')(this._FPS.value)
      }
      _r_prev_time = time
    }
    this._render_worker_id && Ditto.Render.del(this._render_worker_id);
    this._render_worker_id = Ditto.Render.add(on_render);
  }

  stop_update() {
    this._update_worker_id && Ditto.Interval.del(this._update_worker_id);
    this._update_worker_id = void 0;
  }

  private _prev_time: number = Date.now();
  private _skip: number = 0;
  private _expected_dt: number = 0;
  private _applied_dt: number = 0;
  start_update() {
    if (this.disposed) return;
    if (this._update_worker_id) Ditto.Timeout.del(this._update_worker_id);
    this._expected_dt = (1000 / 60) / this._playrate;
    this._applied_dt = Math.max(this._expected_dt, 0)
    const on_update = () => {
      const time = Date.now();
      if (!this._paused) this.update_once()
      const dt = time - this._prev_time;
      this._UPS.update(dt);

      if (this._need_UPS) this._callbacks.emit('on_ups_update')(this._UPS.value);

      let need_render = 0;
      if (1 === this._sync_render) {
        need_render = 1;
      } else if (2 === this._sync_render) {
        need_render = ++this._skip;
        if (2 === this._skip) this._skip = 0;
      }
      if (need_render) {
        this.render_once(dt)
        if (this._need_FPS) {
          if (1 === this._sync_render)
            this._FPS.update(dt);
          else if (2 === this._sync_render)
            this._FPS.update(dt * 2);
          this._callbacks.emit('on_fps_update')(this._FPS.value);
        }
      }
      this._prev_time = time
      this.start_update();
    }
    this._update_worker_id = Ditto.Timeout.add(on_update, this._applied_dt);
  }

  restrict_character(e: Character) {
    if (this.disposed) return;
    if (!this.bg) return;
    const { left, right, near, far, player_left, player_right } = this.stage;

    const is_player = LocalController.is(e.controller);
    const l = is_player ? player_left : left;
    const r = is_player ? player_right : right;

    const { x, z } = e.position;
    if (x < l)
      e.position.x = l;
    else if (x > r)
      e.position.x = r;

    if (z < far)
      e.position.z = far;
    else if (z > near)
      e.position.z = near;
  }

  restrict_ball(e: Ball) {
    if (this.disposed) return;
    if (!this.bg) return;
    const { left, right, near, far } = this.bg.data.base;
    const { x, z } = e.position;
    if (x < left - 800)
      e.enter_frame(Defines.FrameId.Gone)
    else if (x > right + 800)
      e.enter_frame(Defines.FrameId.Gone)
    if (z < far)
      e.position.z = far;
    else if (z > near)
      e.position.z = near;
  }

  restrict_weapon(e: Weapon) {
    if (this.disposed) return;
    if (!this.bg) return;
    const { left, right, near, far } = this.bg.data.base;
    const { x, z } = e.position;
    if (x < left - 100)
      e.enter_frame(Defines.FrameId.Gone)
    else if (x > right + 100)
      e.enter_frame(Defines.FrameId.Gone)
    if (z < far)
      e.position.z = far;
    else if (z > near)
      e.position.z = near;
  }
  restrict(e: Entity) {
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
  update_once() {
    if (this.disposed) return;
    if (!this.bg) return;
    this.collision_detections();
    for (const e of this.entities) {
      e.self_update();

      for (const r of this.nearest_enemy_requesters) {
        if (is_character(e) || r.same_team(e) || e.hp <= 0)
          continue;
        const prev = r.nearest_enemy
        if (!prev || this.manhattan(prev, r) > this.manhattan(e, r)) {
          r.set_nearest_enemy(e)
        }
      }
    }
    for (const e of this.entities) {
      e.update();
      if (e.get_frame().id === Defines.FrameId.Gone)
        this.del_entities(e);
      else if (e.get_frame().state === Defines.State.Gone)
        this.del_entities(e);
    }

    this.update_camera();
    this.bg.update();
    this.stage.update();
  }
  render_once(dt: number) {
    if (this.disposed) return;
    for (const [, r] of this.entity_renders) {
      r.update();
    }
    this.lf2.layout?.on_render(dt);
    this.scene.render()
  }
  cam_speed = 0;
  lock_cam_x: number | undefined = void 0;

  update_camera() {
    const old_cam_x = Math.floor(this.camera.x)
    const { player_left, left, player_right, right } = this.stage;
    const max_cam_left = is_num(this.lock_cam_x) ? left : player_left;
    const max_cam_right = is_num(this.lock_cam_x) ? right : player_right;
    let new_x = this.camera.x;
    let max_speed_ratio = 50;
    let acc_ratio = 1;
    if (is_num(this.lock_cam_x)) {
      new_x = this.lock_cam_x;
      max_speed_ratio = 1000;
      acc_ratio = 10;
    } else if (this.player_slot_characters.size) {
      let l = 0
      new_x = 0;
      for (const [, player] of this.player_slot_characters) {
        const c = player.controller;
        if (!LocalController.is(c)) continue;
        new_x += player.position.x - 794 / 2 + player.facing * 794 / 6;
        ++l;
      }
      new_x = Math.floor(new_x / l);
    }
    if (new_x < max_cam_left) new_x = max_cam_left;
    if (new_x > max_cam_right - 794) new_x = max_cam_right - 794;

    let cur_x = this.camera.x;
    const acc = Math.min(acc_ratio, acc_ratio * Math.abs(cur_x - new_x) / this._screen_w);
    const max_speed = max_speed_ratio * acc

    if (cur_x > new_x) {
      if (this.cam_speed > 0) this.cam_speed = 0;
      else if (this.cam_speed > -max_speed) this.cam_speed -= acc;
      else this.cam_speed = -max_speed;
      this.camera.x += this.cam_speed;
      if (this.camera.x < new_x)
        this.camera.x = new_x;
    }
    else if (cur_x < new_x) {
      if (this.cam_speed < 0) this.cam_speed = 0;
      else if (this.cam_speed < max_speed) this.cam_speed += acc;
      else this.cam_speed = max_speed;
      this.camera.x += this.cam_speed;
      if (this.camera.x > new_x)
        this.camera.x = new_x;
    }

    const new_cam_x = Math.floor(this.camera.x)
    if (old_cam_x !== new_cam_x) {
      this._callbacks.emit('on_cam_move')(new_cam_x);
    }
  }

  private _temp_entitis_set = new Set<Entity>();
  collision_detections() {
    this._temp_entitis_set.clear()
    for (const a of this.entities) {
      for (const b of this._temp_entitis_set) {
        const r0 = this.collision_detection(a, b);
        const r1 = this.collision_detection(b, a);
        if (r0 || r1) continue;
      }
      this._temp_entitis_set.add(a);
    }
  }

  collision_detection(a: Entity, b: Entity) {
    if (b.blinking || b.invisible) return;
    const af = a.get_frame();
    const bf = b.get_frame();
    if (!af.itr?.length || !bf.bdy?.length) return;

    const b_catcher = b.catcher;
    if (b_catcher && b_catcher.get_frame().cpoint?.hurtable !== 1)
      return;

    const l0 = af.itr.length;
    const l1 = bf.bdy.length;
    for (let i = 0; i < l0; ++i) {
      for (let j = 0; j < l1; ++j) {
        /*
          FIXME: 
            在这个循环里continue, 是判断为不碰撞;
            再加上switch的break，不太符合人的直觉，但是……?
              -Gim
        */
        let itr = af.itr[i];
        const bdy = bf.bdy[j];
        switch (af.state) {
          case Defines.State.Weapon_OnHand: {
            if (!is_weapon(a)) continue;
            const atk = a.holder?.get_frame().wpoint?.attacking;
            if (!atk) continue;
            const override_itr = a.data.weapon_strength?.[atk];
            if (!override_itr) continue;
            itr = { ...itr, ...override_itr }
            break;
          }
          case Defines.State.BurnRun: {
            if (bf.state === Defines.State.Burning) continue;
            break;
          }
        }
        switch (itr.kind) {
          case Defines.ItrKind.Block:
          case Defines.ItrKind.CharacterThrew:
          case Defines.ItrKind.MagicFlute:
            continue; // todo
          case Defines.ItrKind.Pick:
            if (
              a.holding || b.holder ||
              !is_character(a) ||
              !is_weapon(b) || (
                bf.state !== Defines.State.Weapon_OnGround &&
                bf.state !== Defines.State.HeavyWeapon_OnGround
              )
            ) continue;
            break;
          case Defines.ItrKind.PickSecretly:
            if (
              a.holding || b.holder ||
              !is_character(a) ||
              !is_weapon(b) ||
              bf.state !== Defines.State.Weapon_OnGround
            ) continue;
            break;
          case Defines.ItrKind.ForceCatch:
            if (is_character(a) && is_character(b)) break;
            continue;
          case Defines.ItrKind.Catch:
            if (is_character(a) && is_character(b) && bf.state === Defines.State.Tired) break;
            continue;
          case Defines.ItrKind.SuperPunchMe:
            if (is_character(b) && !b.holding && (b.get_frame().state === Defines.State.Standing || b.get_frame().state === Defines.State.Walking)) break;
            continue;
          case Defines.ItrKind.Normal:
            if (is_character(a) && bf.state === Defines.State.Weapon_OnGround) continue;
            break
          case Defines.ItrKind.Heal:
          case Defines.ItrKind.DeadWhenHit:
          case Defines.ItrKind.Fly:
          case Defines.ItrKind.Ice:
        }
        switch (itr.effect) {
          case Defines.ItrEffect.MFire1:
          case Defines.ItrEffect.MFire2:
            if (bf.state === Defines.State.BurnRun) continue;
            if (bf.state === Defines.State.Burning) continue;
            break;
          case Defines.ItrEffect.Fire:
            if (af.state === Defines.State.BurnRun) continue;
            break;
          case Defines.ItrEffect.Through:
            if (is_character(b)) continue;
            break;
        }

        if (!(itr.friendly_fire || bdy.friendly_fire) && a.same_team(b)) continue;

        switch (bf.state) {
          case Defines.State.Falling: {
            if (!itr.fall || itr.fall < 60) continue;
            break;
          }
        }
        if (!itr.vrest && a.a_rest) continue;
        if (itr.vrest && b.get_v_rest_remain(a.id) > 0) continue;

        const r0 = this.get_cube(a, af, itr);
        const r1 = this.get_cube(b, bf, bdy);
        if (
          r0.left <= r1.right &&
          r0.right >= r1.left &&
          r0.bottom <= r1.top &&
          r0.top >= r1.bottom &&
          r0.far <= r1.near &&
          r0.near >= r1.far
        ) {
          this.handle_collision(a, itr, r0, b, bdy, r1);
          return true;
        }
      }
    }
    return false;
  }

  spark(x: number, y: number, z: number, f: string) {
    const data = this.lf2.datas.find(Defines.BuiltIn.Dats.Spark);
    if (!data) {
      Warn.print(World.TAG + '::spark', `data of "${Defines.BuiltIn.Dats.Spark}" not found!`);
      return;
    }
    const create = Factory.inst.get(data.type);
    if (!create) {
      Warn.print(World.TAG + '::spark', `creator of "${data.type}" not found!`);
      return;
    }
    const e = create(this, data)
    e.position.set(x, y, z)
    e.enter_frame(f)
    e.attach()
  }

  handle_collision(
    attacker: Entity, itr: IItrInfo, a_cube: ICube,
    victim: Entity, bdy: IBdyInfo, b_cube: ICube,
  ) {
    attacker.on_collision(victim, itr, bdy, a_cube, b_cube);
    victim.on_be_collided(attacker, itr, bdy, a_cube, b_cube);
  }
  get_cube(e: Entity, f: IFrameInfo, i: IItrInfo | IBdyInfo): ICube {
    const left = e.facing > 0 ?
      e.position.x - f.centerx + i.x :
      e.position.x + f.centerx - i.x - i.w;
    const top = e.position.y + f.centery - i.y;
    const length = 30;
    const far = e.position.z - length / 2;
    const near = far + length;
    return { left, right: left + i.w, top, bottom: top - i.h, near, far }
  }

  private _playrate = 1;
  get playrate() { return this._playrate }
  set playrate(v: number) {
    if (v <= 0) throw new Error('playrate must be larger than 0')
    if (v === this._playrate) return;
    this._playrate = v;
    this.start_update()
  }

  private _paused = false;
  get paused() { return this._paused }
  set paused(v: boolean) { this.set_paused(v) }

  set_paused(v: boolean) {
    if (this._paused === v) return;
    this._paused = v;
    this._callbacks.emit('on_pause_change')(v);
  }

  private _show_indicators = false;
  get show_indicators() { return this._show_indicators }
  set show_indicators(v: boolean) {
    if (this._show_indicators === v) return;
    this._show_indicators = v;
    for (const [, r] of this.entity_renders) {
      r.indicators.show = v;
    }
  }
  dispose() {
    this._callbacks.emit('on_disposed')();
    this.bg.dispose();
    this.stop_update();
    this.stop_render();
    this.del_entities(...this.entities);
    this.scene.dispose();
  }
}