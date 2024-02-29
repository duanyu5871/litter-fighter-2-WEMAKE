import * as THREE from 'three';
import { Defines } from '../defines';
import Character from './Character';
import PlayerController from './Controller/PlayerController';
import Entity from './Entity';
import GameObj, { GONE_FRAME_INFO } from './GameObj';
import { Grand } from './Grand';
import { data_map } from './loader/preprocess_data';
export interface ICube {
  left: number;
  right: number;
  top: number;
  bottom: number;
  near: number;
  far: number;
}
export default class World {
  static readonly DEFAULT_GRAVITY = 0.9;
  static readonly DEFAULT_FRICTION_FACTOR = 0.95//0.894427191;
  static readonly DEFAULT_FRICTION = 0.1;

  gravity = World.DEFAULT_GRAVITY;
  friction_factor = World.DEFAULT_FRICTION_FACTOR;
  friction = World.DEFAULT_FRICTION;

  scene: THREE.Scene = new THREE.Scene();
  camera: THREE.Camera = new THREE.OrthographicCamera();
  grand: Grand = new Grand(this);

  entities = new Set<Entity>();
  game_objs = new Set<GameObj>();

  renderer: THREE.WebGLRenderer;
  disposed = false;
  protected _players = new Set<Character>();
  get width() { return this.grand.boundarys.right - this.grand.boundarys.left }
  get depth() { return this.grand.boundarys.far - this.grand.boundarys.near };

  constructor(canvas: HTMLCanvasElement) {
    this.renderer = new THREE.WebGLRenderer({ canvas });
    const wtf = Math.sqrt(2 * Math.pow(550, 2)) / 4;
    this.camera.position.y = Math.floor(wtf * 3);
    this.camera.position.z = Math.floor(wtf * 3);
    this.camera.rotateX(-Math.PI / 4);
  }

  add_game_objs(...objs: GameObj[]) {
    objs.forEach(e => {
      if (e instanceof Entity) {
        this.add_entities(e);
      } else {
        this.scene.add(e.sprite)
        this.game_objs.add(e)
      }
    })

  }

  remove_game_objs(...game_objs: GameObj[]) {
    game_objs.forEach(e => {
      if (e instanceof Entity) {
        this.add_entities(e);
      } else {
        this.scene.remove(e.sprite);
        this.game_objs.delete(e);
      }
    })
  }
  add_entities(...entities: Entity[]) {
    entities.forEach(e => {
      this.scene.add(e.sprite);
      this.scene.add(e.shadow);
      e.show_indicators = this._show_indicators;
      if (e instanceof Character && e.controller instanceof PlayerController) {
        this._players.add(e);
      }
      this.entities.add(e)
    })
  }

  remove_entities(...entities: Entity[]) {
    entities.forEach(e => {
      this.scene.remove(e.sprite);
      this.scene.remove(e.shadow);
      this.entities.delete(e)
      if (e instanceof Character && e.controller instanceof PlayerController) {
        this._players.delete(e);
      }
    })
  }

  private _render_request_id?: ReturnType<typeof requestAnimationFrame>;
  private _update_timer_id?: ReturnType<typeof setInterval>;

  private _on_render = () => {
    if (this.disposed) return;
    this.renderer.render(this.scene, this.camera);
    this._render_request_id = requestAnimationFrame(this._on_render)
  }
  start_render() {
    if (this.disposed) return;
    this._render_request_id && cancelAnimationFrame(this._render_request_id);
    this._render_request_id = requestAnimationFrame(this._on_render);
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
  update_once() {
    if (this.disposed) return;

    const { left, right, near, far } = this.grand.boundarys;
    for (const e of this.entities) {
      e.update();
      const { x, z } = e.sprite.position;
      if (x < left)
        e.position.x = e.sprite.position.x = left;
      else if (x > right)
        e.position.x = e.sprite.position.x = right;

      if (z < far)
        e.position.z = e.sprite.position.z = far;
      else if (z > near)
        e.position.z = e.sprite.position.z = near;

      if (e.get_frame().id === GONE_FRAME_INFO.id)
        this.remove_entities(e);
    }

    for (const e of this.game_objs) {
      e.update();
      if (e.get_frame().id === GONE_FRAME_INFO.id)
        this.remove_game_objs(e);
    }

    this.collision_detections();
    this.update_camera();
    this.grand.update();
  }
  private update_camera() {
    const player_count = this._players.size;
    if (!player_count) return;
    let new_x = 0;
    for (const player of this._players) {
      new_x += player.sprite.position.x - 794 / 2 + player.face * 794 / 6;
    }
    new_x /= player_count;
    const { left, right } = this.grand.boundarys;
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


        if (itr.kind === 0 && bdy.kind === 0) {

          if (itr.vrest) {
            if (b.v_rests.has(a.id)) {
              if (this._show_indicators) console.log(b.v_rests);
              continue;
            }
          }
          else if (a.a_rest) continue;

          const r0 = this.get_cube(a, af, itr);
          const r1 = this.get_cube(b, bf, bdy);
          if (this._show_indicators) console.log(itr, bdy, r0, r1)
          if (
            r0.left <= r1.right &&
            r0.right >= r1.left &&
            r0.bottom <= r1.top &&
            r0.top >= r1.bottom &&
            r0.far <= r1.near &&
            r0.near >= r1.far
          ) {
            if (itr.effect === 4) continue; // todo
            if (
              (!itr.fall || itr.fall < 60) &&
              (b.get_frame().state === Defines.State.Falling)
            ) continue; // todo
            this.handle_collision(a, itr, r0, b, bdy, r1);
            return true;
          }
        }
      }
    }
    return false;
  }
  spark(x: number, y: number, z: number, f: number | string) {
    const data = data_map.get("spark");
    if (!data || !('frames' in data)) return;
    const e = new GameObj(this, data)
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
  get_cube(e: GameObj, f: IFrameInfo, i: IItrInfo | IBdyInfo): ICube {
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
    this.grand.dispose();
    this.stop_update();
    this.stop_render();
    this.renderer.dispose();
    this.entities.forEach(e => e.dispose())
  }
}