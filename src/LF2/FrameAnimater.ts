import { Warn } from '@fimagine/logger';
import * as THREE from 'three';
import { constructor_name } from '../common/constructor_name';
import { IFrameInfo, IGameObjData, IGameObjInfo, INextFrame, ITexturePieceInfo, TFace, TNextFrame } from '../common/lf2_type';
import { Defines } from '../common/lf2_type/defines';
import { random_get } from './utils/math/random';
import IPicture from '../common/lf2_type/IPicture';
import type { World } from './World';
import { new_id } from './base/new_id';
import { turn_face } from './entity/face_helper';
import create_pictures from './loader/create_pictures';
import { factory } from './Factory';
import { is_str, is_positive } from './utils/type_check';
import { dispose_mesh } from './layout/utils/dispose_mesh';

export const EMPTY_PIECE: ITexturePieceInfo = {
  tex: 0, x: 0, y: 0, w: 0, h: 0, cx: 0, cy: 0,
  ph: 0, pw: 0,
}
export const EMPTY_FRAME_INFO: IFrameInfo = {
  id: Defines.FrameId.None,
  name: '',
  pic: 0,
  state: NaN,
  wait: 0,
  next: { id: Defines.FrameId.Auto },
  centerx: 0,
  centery: 0
};
export const GONE_FRAME_INFO: IFrameInfo = {
  id: Defines.FrameId.Gone,
  name: 'GONE_FRAME_INFO',
  pic: 0,
  state: NaN,
  wait: 0,
  next: { id: Defines.FrameId.Gone },
  centerx: 0,
  centery: 0
};


export class FrameAnimater<
  F extends IFrameInfo = IFrameInfo,
  I extends IGameObjInfo = IGameObjInfo,
  D extends IGameObjData<I, F> = IGameObjData<I, F>
> {
  id: string = new_id();
  wait: number = 0;

  readonly is_frame_animater = true
  static is = (v: any): v is FrameAnimater => v?.is_frame_animater === true;


  readonly data: D;
  readonly world: World;
  readonly pictures: Map<string, IPicture<THREE.Texture>>;
  readonly mesh: THREE.Mesh<THREE.PlaneGeometry, THREE.MeshBasicMaterial>;
  readonly position = new THREE.Vector3(0, 0, 0);
  protected _piece: ITexturePieceInfo = EMPTY_PIECE;
  protected _facing: TFace = 1;
  protected _frame: F = EMPTY_FRAME_INFO as F;
  protected _next_frame: TNextFrame | undefined = void 0;
  protected _prev_frame: F = EMPTY_FRAME_INFO as F;

  get facing() { return this._facing; }
  set facing(v: TFace) {
    if (this._facing === v) { return; }
    this._facing = v;
    this.update_sprite();
  }

  set_frame(v: F) {
    this._prev_frame = this._frame;
    this._frame = v;
  }
  get_frame() { return this._frame; }
  get_prev_frame() { return this._prev_frame; }

  constructor(world: World, data: D) {
    this.data = data;
    this.world = world;
    this.pictures = create_pictures(world.lf2, data);

    const first_text = this.pictures.get('0')?.texture;
    const mesh = this.mesh = new THREE.Mesh(
      new THREE.PlaneGeometry(1, 1).translate(0.5, -0.5, 0),
      new THREE.MeshBasicMaterial({
        map: first_text,
        transparent: true,
      })
    );
    if (first_text) first_text.onUpdate = () => mesh.material.needsUpdate = true

    mesh.userData.owner = this;
    mesh.name = 'FrameAnimater';
    this.mesh.visible = false;
  }

  on_spawn_by_emitter(...args: any[]): this {
    return this;
  }

  update_sprite_position() {
    const { x, y, z } = this.position;
    const { centerx, centery } = this._frame
    const offset_x = this._facing === 1 ? centerx : this.mesh.scale.x - centerx
    this.mesh.position.set(x - offset_x, y - z / 2 + centery, z);
    this.mesh.updateMatrix()
  }

  attach(): this {
    this.update_sprite();
    this.world.add_game_objs(this);
    this.mesh.visible = true;
    return this;
  }
  private _previous = {
    face: (void 0) as TFace | undefined,
    frame: (void 0) as F | undefined,
  }
  protected update_sprite() {
    const frame = this.get_frame();
    if (
      this._previous.face === this._facing &&
      this._previous.frame === this._frame
    ) {
      return;
    }
    this._previous.face = this._facing;
    this._previous.frame = this._frame;
    const sprite = this.mesh;
    const piece = frame.pic;
    if (typeof piece === 'number' || !('1' in piece)) {
      return;
    }
    if (this._piece !== piece[this._facing]) {
      const { x, y, w, h, tex, pw, ph } = this._piece = piece[this._facing];
      const pic = this.pictures.get('' + tex);
      if (pic) {
        pic.texture.offset.set(x, y);
        pic.texture.repeat.set(w, h);
        if (pic.texture !== sprite.material.map) {
          sprite.material.map = pic.texture;
        }
        sprite.material.needsUpdate = true
      }
      sprite.scale.set(pw, ph, 0)
    }
    this.update_sprite_position();
  }

  find_auto_frame(): F {
    Warn.print(constructor_name(this), 'find_auto_frame(), not implemented! will return current frame.');
    return this.get_frame();
  }

  find_frame_by_id(id: string | undefined): F;
  find_frame_by_id(id: string | undefined, exact: true): F | undefined;
  find_frame_by_id(id: string | undefined, exact: boolean = false): F | undefined {
    if (exact) return id ? this.data.frames[id] : void 0;
    switch (id) {
      case void 0:
      case Defines.FrameId.None:
      case Defines.FrameId.Self: return this.get_frame();
      case Defines.FrameId.Auto: return this.find_auto_frame();
      case Defines.FrameId.Gone: return GONE_FRAME_INFO as F;
    }
    if (!this.data.frames[id]) {
      Warn.print(constructor_name(this), 'find_frame_by_id(id), frame not find! id:', id);
      return EMPTY_FRAME_INFO as F;
    }
    return this.data.frames[id];
  }

  get_next_frame(which: TNextFrame | string): [F | undefined, INextFrame | undefined] {
    if (is_str(which)) {
      const frame = this.find_frame_by_id(which);
      return [frame, void 0];
    }
    if (Array.isArray(which)) {
      const l = which.length;
      const remains: INextFrame[] = [];
      for (let i = 0; i < l; ++i) {
        const w = which[i];
        const { expression: condition } = w;
        if (typeof condition !== 'function') {
          remains.push(w);
          continue;
        }
        if (condition(this)) {
          return this.get_next_frame(w);
        }
      }
      if (!remains.length) return [void 0, void 0];
      which = random_get(remains)!;
      return this.get_next_frame(which);
    }
    let { id } = which;
    if (Array.isArray(id)) id = random_get(id);
    const frame = this.find_frame_by_id(id);
    return [frame, which];
  }

  /**
   * 进入下一帧时，需要处理朝向
   * 
   * @see {Defines.FacingFlag}
   * @param facing 目标朝向, 可参考Defines.FacingFlag
   * @param frame 帧
   * @param flags 
   * @returns 返回新的朝向
   */
  handle_facing_flag(facing: number, frame: IFrameInfo, flags: INextFrame): -1 | 1 {
    switch (facing) {
      case Defines.FacingFlag.Backward:
        return turn_face(this.facing);
      case Defines.FacingFlag.Left:
      case Defines.FacingFlag.Right:
        return facing;
      default:
        return this.facing;
    }
  }

  handle_wait_flag(wait: string | number, frame: IFrameInfo, flags: INextFrame): number {
    if (wait === 'i') return this.wait;
    if (is_positive(wait)) return this.wait;
    return frame.wait;
  }

  enter_frame(which: TNextFrame | string): void {
    const [frame, flags] = this.get_next_frame(which);
    if (!frame) {
      this._next_frame = void 0;
      return
    }
    const { sound } = frame;
    const { x, y, z } = this.position;
    sound && this.world.lf2.sounds.play(sound, x, y, z);
    this.set_frame(frame);

    if (flags?.facing !== void 0) this.facing = this.handle_facing_flag(flags.facing, frame, flags);
    if (flags?.wait !== void 0) this.wait = this.handle_wait_flag(flags.wait, frame, flags);
    else this.wait = frame.wait;
    this.update_sprite();
    this._next_frame = void 0;
  }

  self_update() {
    if (this._next_frame) this.enter_frame(this._next_frame);
  }
  update() {
    if (this._next_frame) this.enter_frame(this._next_frame);
    if (this.wait > 0) { --this.wait; }
    else { this._next_frame = this._frame.next; }
    this.update_sprite_position();
  }

  dispose(): void {
    this.mesh && dispose_mesh(this.mesh);
    for (const [, pic] of this.pictures)
      pic.texture.dispose();
  }
}

factory.set('frame_animater', (...args) => new FrameAnimater(...args));
