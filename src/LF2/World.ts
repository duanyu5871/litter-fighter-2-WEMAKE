import * as THREE from 'three';
import { Log } from '../Log';
import { is_num } from '../js_utils/is_num';
import { IBdyInfo, IFrameInfo, IItrInfo } from '../js_utils/lf2_type';
import { Defines } from '../js_utils/lf2_type/defines';
import { FPS } from './FPS';
import { FrameAnimater } from './FrameAnimater';
import { GameOverlay } from './GameOverlay';
import LF2 from './LF2';
import Stage from './Stage';
import { PlayerController } from './controller/PlayerController';
import { Ball } from './entity/Ball';
import { Character } from './entity/Character';
import { Entity } from './entity/Entity';
import './entity/Weapon';
import { Weapon } from './entity/Weapon';
export interface ICube {
  left: number;
  right: number;
  top: number;
  bottom: number;
  near: number;
  far: number;
}
export interface IWorldCallbacks {
  on_disposed?(world: World): void;
  on_stage_change?(world: World, curr: Stage, prev: Stage): void;
  on_cam_move?(world: World, x: number): void;
  on_pause_change?(world: World, pause: boolean): void;
}

export class World {
  static readonly DEFAULT_GRAVITY = 0.4;
  static readonly DEFAULT_FRICTION_FACTOR = 0.95//0.894427191;
  static readonly DEFAULT_FRICTION = 0.2;

  readonly lf2: LF2
  readonly callbacks = new Set<IWorldCallbacks>()
  gravity = World.DEFAULT_GRAVITY;
  friction_factor = World.DEFAULT_FRICTION_FACTOR;
  friction = World.DEFAULT_FRICTION;
  scene: THREE.Scene = new THREE.Scene();
  camera: THREE.OrthographicCamera = new THREE.OrthographicCamera();

  private _stage: Stage;
  entities = new Set<Entity>();
  game_objs = new Set<FrameAnimater>();
  renderer: THREE.WebGLRenderer;
  disposed = false;

  readonly players = new Map<string, Character>();
  readonly overlay: GameOverlay;
  private _player: any;

  get stage() { return this._stage }
  set stage(v) {
    if (v === this._stage) return;
    const old = this._stage;
    this._stage = v;
    for (const i of this.callbacks) i.on_stage_change?.(this, v, old)
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
  constructor(lf2: LF2, canvas: HTMLCanvasElement, overlay?: HTMLDivElement | null) {
    this.lf2 = lf2;
    this.renderer = new THREE.WebGLRenderer({ canvas });
    const w = Defines.OLD_SCREEN_WIDTH;
    const h = 450;//Defines.OLD_SCREEN_HEIGHT;
    this.camera.left = 0;
    this.camera.right = w;
    this.camera.bottom = 0;
    this.camera.top = h;
    this.camera.position.z = 10
    this.camera.near = 1;
    this.camera.updateProjectionMatrix()
    this.renderer.setSize(w, h, false);
    this.overlay = new GameOverlay(this, overlay);
    this._stage = new Stage(this, Defines.THE_VOID_BG);
  }

  add_game_objs(...objs: FrameAnimater[]) {
    for (const e of objs) {
      if (e instanceof Entity) {
        this.add_entities(e);
      } else {
        this.scene.add(e.sprite)
        this.game_objs.add(e)
      }
    }
  }

  del_game_objs(...objs: FrameAnimater[]) {
    for (const e of objs) {
      if (e instanceof Entity) {
        this.del_entities(e);
      } else {
        this.game_objs.delete(e);
        e.dispose();
      }
    }
  }

  add_entities(...entities: Entity[]) {
    for (const e of entities) {
      this.scene.add(e.sprite);
      this.scene.add(e.shadow);
      e.show_indicators = this._show_indicators;
      if (e instanceof Character && e.controller instanceof PlayerController) {
        this.players.set(e.controller.which, e);
      }
      this.entities.add(e)
    }
  }

  del_entities(...entities: Entity[]) {
    for (const e of entities) {
      this.entities.delete(e)
      e.dispose();
      if (e instanceof Character && e.controller instanceof PlayerController) {
        this.players.delete(e.controller.which);
      }
    }
  }

  private _render_request_id?: ReturnType<typeof requestAnimationFrame>;
  private _update_timer_id?: ReturnType<typeof setInterval>;


  private _r_prev_time = 0;
  private _r_fps = new FPS()
  private _u_prev_time = 0;
  private _u_fps = new FPS()
  render_once() {
    if (this.disposed) return;
    for (const e of this.entities) {
      e.indicators.update();
    }
    this.renderer.render(this.scene, this.camera);
  }

  start_render() {
    if (this.disposed) return;
    const on_render = (time: number) => {
      if (this._r_prev_time !== 0) {
        this.render_once()
        this._r_fps.update(time - this._r_prev_time);
        this.overlay.FPS = this._r_fps.value
      }
      this._render_request_id = requestAnimationFrame(on_render)
      this._r_prev_time = time
    }
    this._render_request_id && cancelAnimationFrame(this._render_request_id);
    this._render_request_id = requestAnimationFrame(on_render);
  }

  stop_render() {
    this._render_request_id && cancelAnimationFrame(this._render_request_id);
    this._render_request_id = 0;
  }

  start_update() {
    if (this.disposed) return;
    if (this._update_timer_id) clearInterval(this._update_timer_id);
    const dt = Math.max((1000 / 60) / this._playrate, 1);
    const on_update = () => {
      const time = Date.now()
      if (this._u_prev_time !== 0) {
        this.update_once()
        this._u_fps.update(time - this._u_prev_time)
        this.overlay.UPS = this._u_fps.value
      }
      this._u_prev_time = time
    }
    this._update_timer_id = setInterval(on_update, dt);
  }

  restrict_character(e: Character) {
    if (this.disposed) return;
    if (!this.bg) return;
    const { left, right, near, far, player_left, player_right } = this.stage;

    const is_player = e.controller instanceof PlayerController;
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
      e.enter_frame(Defines.ReservedFrameId.Gone)
    else if (x > right + 800)
      e.enter_frame(Defines.ReservedFrameId.Gone)
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
      e.enter_frame(Defines.ReservedFrameId.Gone)
    else if (x > right + 100)
      e.enter_frame(Defines.ReservedFrameId.Gone)
    if (z < far)
      e.position.z = far;
    else if (z > near)
      e.position.z = near;
  }
  restrict(e: Entity | THREE.Sprite) {
    if (e instanceof Character) {
      this.restrict_character(e);
    } else if (e instanceof Ball) {
      this.restrict_ball(e);
    } else if (e instanceof Weapon) {
      this.restrict_weapon(e);
    } else if (e instanceof THREE.Sprite) {
      this.restrict_name_sprite(e);
    }
  }
  restrict_name_sprite(e: THREE.Sprite) {
    const { x } = e.position;
    const hw = (e.scale.x + 10) / 2
    const { x: cam_l } = this.camera.position;
    const cam_r = cam_l + Defines.OLD_SCREEN_WIDTH;
    if (x + hw > cam_r) e.position.x = cam_r - hw;
    else if (x - hw < cam_l) e.position.x = cam_l + hw;
  }
  update_once() {
    if (this.disposed) return;
    if (!this.bg) return;
    this.collision_detections();
    for (const e of this.entities) e.self_update();
    for (const e of this.entities) e.update();
    for (const e of this.entities)
      if (e.get_frame().id === Defines.ReservedFrameId.Gone)
        this.del_entities(e);
      else if (e.get_frame().state === Defines.State.Gone)
        this.del_entities(e);

    for (const e of this.game_objs) e.self_update();
    for (const e of this.game_objs) e.update();
    for (const e of this.game_objs)
      if (e.get_frame().id === Defines.ReservedFrameId.Gone)
        this.del_game_objs(e);

    this.update_camera();
    this.bg.update();
  }
  cam_speed = 0;
  lock_cam_x: number | undefined = void 0;

  update_camera() {
    const old_cam_x = Math.floor(this.camera.position.x)
    const { player_left: left, player_right: right } = this.stage;
    let new_x = this.camera.position.x;
    let max_speed_ratio = 50;
    let acc_ratio = 1;
    if (is_num(this.lock_cam_x)) {
      new_x = this.lock_cam_x;
      max_speed_ratio = 1000;
      acc_ratio = 10;
    } else if (this.players.size) {
      new_x = 0;
      for (const [, player] of this.players)
        new_x += player.position.x - 794 / 2 + player.facing * 794 / 6;
      new_x = Math.floor(new_x / this.players.size);
    }
    if (new_x < left) new_x = left;
    if (new_x > right - 794) new_x = right - 794;

    let cur_x = this.camera.position.x;
    const acc = Math.min(acc_ratio, acc_ratio * Math.abs(cur_x - new_x) / Defines.OLD_SCREEN_WIDTH);
    const max_speed = max_speed_ratio * acc

    if (cur_x > new_x) {
      if (this.cam_speed > 0) this.cam_speed = 0;
      else if (this.cam_speed > -max_speed) this.cam_speed -= acc;
      else this.cam_speed = -max_speed;
      this.camera.position.x += this.cam_speed;
      if (this.camera.position.x < new_x)
        this.camera.position.x = new_x;
    }
    else if (cur_x < new_x) {
      if (this.cam_speed < 0) this.cam_speed = 0;
      else if (this.cam_speed < max_speed) this.cam_speed += acc;
      else this.cam_speed = max_speed;
      this.camera.position.x += this.cam_speed;
      if (this.camera.position.x > new_x)
        this.camera.position.x = new_x;
    }

    const new_cam_x = Math.floor(this.camera.position.x)
    if (old_cam_x !== new_cam_x) {
      for (const i of this.callbacks) i.on_cam_move?.(this, new_cam_x)
    }
  }

  collision_detections() {
    const bs = new Set<Entity>();
    for (const a of this.entities) {
      for (const b of bs) {
        const r0 = this.collision_detection(a, b);
        const r1 = this.collision_detection(b, a);
        if (r0 || r1) continue;
      }
      bs.add(a);
    }
  }

  itr_log = Log.Clone().print.bind({}, 'collision_detection');
  itr_pick_weapon_log = (itr: IItrInfo, ...args: any[]) => {
    if (itr.kind !== Defines.ItrKind.Pick) return
    return this.itr_log(itr, ...args);
  }
  collision_detection(a: Entity, b: Entity) {
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
        let itr = af.itr[i];
        const bdy = bf.bdy[j];
        switch (af.state) {
          case Defines.State.Weapon_OnHand: {
            if (!(a instanceof Weapon)) continue;
            const atk = a.holder?.get_frame().wpoint?.attacking;
            if (!atk) continue;
            const ooo = a.data.weapon_strength?.[atk];
            if (!ooo) continue;
            itr = { ...itr, ...ooo }
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
            if (!(b instanceof Weapon)) continue;
            if (bf.state === Defines.State.Weapon_OnGround) break;
            if (bf.state === Defines.State.HeavyWeapon_OnGround) break;
            continue;
          case Defines.ItrKind.PickSecretly:
            if (!(b instanceof Weapon) || b.data.base.type === Defines.WeaponType.Heavy) continue;
            if (bf.state === Defines.State.Weapon_OnGround) break;
            continue;
          case Defines.ItrKind.ForceCatch:
            if (b instanceof Character) break;
            continue;
          case Defines.ItrKind.Catch:
            if (b instanceof Character && bf.state === Defines.State.Tired) break;
            continue;
          case Defines.ItrKind.SuperPunchMe:
            if (b instanceof Character && !b.weapon && (b.get_frame().state === Defines.State.Standing || b.get_frame().state === Defines.State.Walking)) break;
            continue;
          case Defines.ItrKind.Normal:
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
          case Defines.ItrEffect.Through: continue; // TODO
        }
        if (
          (a.team && a.team === b.team && !itr.friendly_fire && !bdy.friendly_fire)
        ) continue;

        switch (bf.state) {
          case Defines.State.Falling: {
            if (!itr.fall || itr.fall < 60) continue;
            break;
          }
        }
        if (!itr.vrest && a.a_rest) continue;
        if (itr.vrest && b.v_rests.has(a.id) && b.v_rests.get(a.id)!.remain > 0) continue;

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
    const data = this.lf2.dat_mgr.find("spark");
    if (!data || !('frames' in data)) return;
    const e = new FrameAnimater(this, data)
    e.position.set(x, y, z)
    e.sprite.material.depthTest = false;
    e.sprite.material.depthWrite = false;
    e.sprite.renderOrder = 2
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
  get_cube(e: FrameAnimater, f: IFrameInfo, i: IItrInfo | IBdyInfo): ICube {
    const left = e.facing > 0 ?
      e.position.x - f.centerx + i.x :
      e.position.x + f.centerx - i.x - i.w;
    const top = e.position.y + f.centery - i.y;
    const length = 20;
    const far = e.position.z - length / 2;
    const near = far + length;
    return { left, right: left + i.w, top, bottom: top - i.h, near, far }
  }
  stop_update() {
    this._update_timer_id && clearInterval(this._update_timer_id);
    this._update_timer_id = void 0;
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
  set paused(v: boolean) {
    this._paused = v;
    if (v && this._update_timer_id)
      this.stop_update();
    else if (!this._update_timer_id)
      this.start_update();
    for (const i of this.callbacks) i.on_pause_change?.(this, v);
  }

  private _show_indicators = false;
  get show_indicators() { return this._show_indicators }
  set show_indicators(v: boolean) {
    if (this._show_indicators === v) return;
    this._show_indicators = v;
    this.entities.forEach(e => {
      if (e instanceof Entity)
        e.show_indicators = v;
    })
  }
  dispose() {
    for (const i of this.callbacks) i.on_disposed?.(this);
    this.bg.dispose();
    this.stop_update();
    this.stop_render();
    this.del_entities(...this.entities);
    this.del_game_objs(...this.game_objs);
    this.renderer.clear()
    this.renderer.dispose();
    this._r_fps.dispose();
    this._u_fps.dispose();
  }
}
