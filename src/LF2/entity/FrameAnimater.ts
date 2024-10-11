import { Warn } from '@fimagine/logger';
import * as THREE from 'three';
import { IBaseNode, IMeshNode } from '../3d';
import type LF2 from '../LF2';
import type { World } from '../World';
import { new_id } from '../base/new_id';
import type { IFrameInfo, IGameObjData, IGameObjInfo, INextFrame, ITexturePieceInfo, TFace, TNextFrame } from '../defines';
import IPicture from '../defines/IPicture';
import { Defines } from '../defines/defines';
import Ditto from '../ditto';
import create_pictures from '../loader/create_pictures';
import { constructor_name } from '../utils/constructor_name';
import { random_get } from '../utils/math/random';
import { is_positive, is_str } from '../utils/type_check';
import { Factory } from './Factory';
import { turn_face } from './face_helper';

export const EMPTY_PIECE: ITexturePieceInfo = {
  tex: 0, x: 0, y: 0, w: 0, h: 0,
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

export default class FrameAnimater<
  F extends IFrameInfo = IFrameInfo,
  I extends IGameObjInfo = IGameObjInfo,
  D extends IGameObjData<I, F> = IGameObjData<I, F>
> implements IBaseNode {
  id: string = new_id();
  wait: number = 0;

  readonly is_frame_animater = true
  readonly data: D;
  readonly world: World;
  readonly pictures: Map<string, IPicture<THREE.Texture>>;
  readonly inner: IMeshNode;
  readonly position = new THREE.Vector3(0, 0, 0);
  protected _piece: ITexturePieceInfo = EMPTY_PIECE;
  protected _facing: TFace = 1;
  protected _frame: F = EMPTY_FRAME_INFO as F;
  protected _next_frame: TNextFrame | undefined = void 0;
  protected _prev_frame: F = EMPTY_FRAME_INFO as F;

  get lf2(): LF2 { return this.world.lf2 }
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
  private material: THREE.MeshBasicMaterial;
  constructor(world: World, data: D) {
    this.data = data;
    this.world = world;
    this.pictures = create_pictures(world.lf2, data);
    const first_text = this.pictures.get('0')?.texture;
    this.inner = new Ditto.MeshNode(
      world.lf2, {
      geometry: new THREE.PlaneGeometry(1, 1).translate(0.5, -0.5, 0),
      material: this.material = new THREE.MeshBasicMaterial({
        map: first_text,
        transparent: true,
      })
    }
    );
    if (first_text) first_text.onUpdate = () => this.inner.update_all_material()

    this.inner.user_data.owner = this;
    this.inner.name = 'FrameAnimater';
    this.inner.visible = false;
  }
  readonly is_base_node = true;
  get parent(): IBaseNode | undefined {
    throw new Error('Method not implemented.');
  }
  set parent(v: IBaseNode | undefined) {
    throw new Error('Method not implemented.');
  }
  get children(): readonly IBaseNode[] { return [] }
  get name(): string { return this.inner.name }
  set name(v: string) { this.inner.name = v }
  get user_data(): Record<string, any> { return this.inner.user_data }
  set user_data(v: Record<string, any>) { this.inner.user_data = v }

  apply(): this { this.inner.apply(); return this; }
  add(...sp: IBaseNode[]): this { this.inner.add(...sp); return this; }
  del(...sp: IBaseNode[]): this { this.inner.del(...sp); return this; }
  del_self(): this { this.inner.del_self(); return this; }
  get_user_data(key: string) { return this.inner.get_user_data(key) }
  add_user_data(key: string, value: any): this { this.inner.add_user_data(key, value); return this; }
  del_user_data(key: string): this { this.inner.del_user_data(key); return this; }
  merge_user_data(v: Record<string, any>): this { this.inner.merge_user_data(v); return this; }

  on_spawn_by_emitter(...args: any[]): this {
    return this;
  }

  update_sprite_position() {
    const { x, y, z } = this.position;
    const { centerx, centery } = this._frame
    const offset_x = this._facing === 1 ? centerx : this.inner.scale_x - centerx
    this.inner.set_position(x - offset_x, y - z / 2 + centery, z);
  }

  attach(): this {
    this.update_sprite();
    this.world.add_game_objs(this);
    this.inner.visible = true;
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
    const { inner } = this;
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
        if (pic.texture !== this.material.map) {
          this.material.map = pic.texture;
        }
        inner.update_all_material()
      }
      inner.set_scale(pw, ph, 0)
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
    this.inner.dispose()
    for (const [, pic] of this.pictures)
      pic.texture.dispose();
  }
  get_object_3d() {
    return this.inner.get_object_3d()
  }
}

Factory.inst.set('frame_animater', (...args) => new FrameAnimater(...args));