import * as THREE from 'three';
import { Defines } from '.././js_utils/lf2_type/defines';
import { IBdyInfo, IFrameInfo, IItrInfo } from '../js_utils/lf2_type';
import { Background } from './Background';
import { FrameAnimater, GONE_FRAME_INFO } from './FrameAnimater';
import { PlayerController } from './controller/PlayerController';
import { Ball } from './entity/Ball';
import { Character } from './entity/Character';
import { Entity } from './entity/Entity';
import { dat_mgr } from './loader/DatLoader';
export interface ICube {
  left: number;
  right: number;
  top: number;
  bottom: number;
  near: number;
  far: number;
}
export class World {
  static readonly DEFAULT_GRAVITY = 0.4;
  static readonly DEFAULT_FRICTION_FACTOR = 0.95//0.894427191;
  static readonly DEFAULT_FRICTION = 0.2;

  gravity = World.DEFAULT_GRAVITY;
  friction_factor = World.DEFAULT_FRICTION_FACTOR;
  friction = World.DEFAULT_FRICTION;
  scene: THREE.Scene = new THREE.Scene();
  camera: THREE.Camera = new THREE.OrthographicCamera();
  private _bg?: Background;

  entities = new Set<Entity>();
  game_objs = new Set<FrameAnimater>();
  renderer: THREE.WebGLRenderer;
  disposed = false;
  protected _players = new Set<Character>();
  private _update_count: number = 0;

  get bg() { return this._bg }
  set bg(v) {
    if (v === this._bg) return;
    this._bg?.dispose();
    this._bg = v;
  }

  get left() { return this.bg?.left || 0 }
  get right() { return this.bg?.right || 0 }
  get near() { return this.bg?.near || 0 }
  get far() { return this.bg?.far || 0 }
  get width() { return this.bg?.width || 0 }
  get depth() { return this.bg?.depth || 0 };
  get middle() { return this.bg?.middle || { x: 0, z: 0 } }
  constructor(canvas: HTMLCanvasElement) {
    this.renderer = new THREE.WebGLRenderer({ canvas });
    this.camera.position.z = 0;
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
        this.scene.remove(e.sprite);
        this.game_objs.delete(e);
      }
    }
  }

  add_entities(...entities: Entity[]) {
    for (const e of entities) {
      this.scene.add(e.sprite);
      this.scene.add(e.shadow);
      e.show_indicators = this._show_indicators;
      if (e instanceof Character && e.controller instanceof PlayerController) {
        this._players.add(e);
      }
      this.entities.add(e)
    }
  }

  del_entities(...entities: Entity[]) {
    for (const e of entities) {
      this.scene.remove(e.sprite);
      this.scene.remove(e.shadow);
      this.entities.delete(e)

      if (e instanceof Character) {
        if (e.controller instanceof PlayerController)
          this._players.delete(e);
        const ns = e.name_sprite
        if (ns) this.scene.remove(ns)
      }
    }
  }

  private _render_request_id?: ReturnType<typeof requestAnimationFrame>;
  private _update_timer_id?: ReturnType<typeof setInterval>;

  render_once() {
    if (this.disposed) return;
    this.renderer.render(this.scene, this.camera);
  }

  start_render() {
    if (this.disposed) return;
    const on_render = () => {
      this.render_once()
      this._render_request_id = requestAnimationFrame(on_render)
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
    this._update_timer_id = setInterval(this.update_once.bind(this), dt);
  }

  restrict_character(e: Character) {
    if (this.disposed) return;
    if (!this.bg) return;
    const { left, right, near, far } = this.bg.data.base;
    const { x, z } = e.position;
    if (x < left)
      e.position.x = left;
    else if (x > right)
      e.position.x = right;
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
      e.enter_frame({ id: 'gone' })
    else if (x > right + 800)
      e.enter_frame({ id: 'gone' })
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
    for (const e of this.entities) {
      e.update();
      if (e.get_frame().id === GONE_FRAME_INFO.id)
        this.del_entities(e);
    }

    for (const e of this.game_objs) {
      e.update();
      if (e.get_frame().id === GONE_FRAME_INFO.id)
        this.del_game_objs(e);
    }

    this.collision_detections();
    this.update_camera();
    this.bg.update();
  }

  private update_camera() {
    if (!this.bg) return;
    const player_count = this._players.size;
    if (!player_count) return;
    let new_x = 0;
    for (const player of this._players) {
      new_x += player.position.x - 794 / 2 + player.face * 794 / 6;
    }
    new_x /= player_count;
    const { left, right } = this.bg.data.base;
    if (new_x < left) new_x = left;
    if (new_x > right - 794) new_x = right - 794;
    let cur_x = this.camera.position.x;

    this.camera.position.x += (new_x - cur_x) * 0.1;
  }
  cam_speed_x: number = 0;

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
  collision_detection(a: Entity, b: Entity) {
    const af = a.get_frame();
    const bf = b.get_frame();
    const ap = af.pic;
    const bp = bf.pic;
    if (typeof ap === 'number' || typeof bp === 'number') return;

    if (!af.itr?.length || !bf.bdy?.length) return;

    const l0 = af.itr.length;
    const l1 = bf.bdy.length;
    for (let i = 0; i < l0; ++i) {
      for (let j = 0; j < l1; ++j) {
        const itr = af.itr[i];
        const bdy = bf.bdy[j];

        switch (itr.kind as Defines.ItrKind) {
          case Defines.ItrKind.Block:
          case Defines.ItrKind.CharacterThrew:
          case Defines.ItrKind.MagicFlute:
            continue; // todo
          case Defines.ItrKind.Pick:
          case Defines.ItrKind.PickSecretly:
            continue;
          case Defines.ItrKind.ForceCatch:
            if (b instanceof Character) break;
            continue;
          case Defines.ItrKind.Catch:
            if (b instanceof Character && bf.state === Defines.State.Tired) break;
            continue;
          case Defines.ItrKind.SuperPunchMe:
            if (b instanceof Character) break;
            continue;
          case Defines.ItrKind.Normal:
          case Defines.ItrKind.Heal:
          case Defines.ItrKind.DeadWhenHit:
          case Defines.ItrKind.Fly:
          case Defines.ItrKind.Ice:
        }
        if (
          (itr.effect === 4) || // todo
          (a.team === b.team && !itr.friendly_fire && !bdy.friendly_fire)
        ) continue;

        if (!itr.vrest && a.a_rest) { Log.print(af.name, 'a.a_rest = ', a.a_rest); continue; }
        if (itr.vrest && b.v_rests.has(a.id)) { Log.print(af.name, 1, b.v_rests.get(a.id)?.remain); continue; }
        if ((!itr.fall || itr.fall < 60) && b.get_frame().state === Defines.State.Falling) {
          Log.print(af.name, 2); continue;
        }

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
  spark(x: number, y: number, z: number, f: number | string) {
    const data = dat_mgr.find("spark");
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
    if (victim instanceof Character && victim.controller instanceof PlayerController) {
      Log.print('World', 'handle_collision()', attacker.get_frame())
    }
    attacker.on_collision(victim, itr, bdy, a_cube, b_cube);
    victim.on_be_collided(attacker, itr, bdy, a_cube, b_cube);
  }
  get_cube(e: FrameAnimater, f: IFrameInfo, i: IItrInfo | IBdyInfo): ICube {
    const left = e.face > 0 ?
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
    this.bg?.dispose();
    this.stop_update();
    this.stop_render();
    this.renderer.dispose();
    this.entities.forEach(e => e.dispose())
  }
}