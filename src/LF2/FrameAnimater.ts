import { Warn } from '@fimagine/logger';
import * as THREE from 'three';
import random_get from '../common/random_get';
import { constructor_name } from '../common/constructor_name';
import { is_positive_num } from '../common/is_positive_num';
import { is_str } from '../common/is_str';
import { IFrameInfo, IGameObjData, IGameObjInfo, INextFrame, ITexturePieceInfo, TFace, TNextFrame } from '../common/lf2_type';
import { Defines } from '../common/lf2_type/defines';
import { IPictureInfo } from '../types/IPictureInfo';
import type { World } from './World';
import { turn_face } from './entity/face_helper';
import create_pictures from './loader/create_pictures';
import { new_id } from './base/new_id';

export const EMPTY_PIECE: ITexturePieceInfo = {
  tex: 0, x: 0, y: 0, w: 0, h: 0, cx: 0, cy: 0,
  ph: 0, pw: 0,
}
export const EMPTY_FRAME_INFO: IFrameInfo = {
  id: Defines.ReservedFrameId.None,
  name: '',
  pic: 0,
  state: NaN,
  wait: 0,
  next: { id: Defines.ReservedFrameId.Auto },
  centerx: 0,
  centery: 0
};
export const GONE_FRAME_INFO: IFrameInfo = {
  id: Defines.ReservedFrameId.Gone,
  name: 'GONE_FRAME_INFO',
  pic: 0,
  state: NaN,
  wait: 0,
  next: { id: Defines.ReservedFrameId.Gone },
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

  private _disposers: (() => void)[] = [];

  readonly data: D;
  readonly world: World;
  readonly pictures: Map<string, IPictureInfo<THREE.Texture>>;
  readonly sprite: THREE.Sprite;
  readonly position = new THREE.Vector3(0, 0, 0);
  protected _piece: ITexturePieceInfo = EMPTY_PIECE;
  protected _facing: TFace = 1;
  protected _frame: F = EMPTY_FRAME_INFO as F;
  protected _next_frame: TNextFrame | undefined = void 0;
  protected _prev_frame: F = EMPTY_FRAME_INFO as F;

  set disposer(func: () => void) { this._disposers.push(func) }

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

    const material = new THREE.SpriteMaterial({
      map: this.pictures.get('0')?.texture,
    });
    const sprite = this.sprite = new THREE.Sprite(material);
    sprite.userData.owner = this;
    sprite.renderOrder = 1;
  }
  update_sprite_position() {
    const { x, y, z } = this.position;
    this.sprite.position.set(x, y - z / 2, z,);
  }
  attach(): this {
    this.update_sprite();
    this.world.add_game_objs(this);
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

    const sprite = this.sprite;
    const piece = frame.pic;
    if (typeof piece === 'number' || !('1' in piece)) {
      return;
    }
    const { cx, cy } = piece[this._facing];
    if (this._piece !== piece[this._facing]) {
      const { x, y, w, h, tex, pw, ph } = this._piece = piece[this._facing];
      const pic = this.pictures.get('' + tex);
      if (pic) {
        pic.texture.offset.set(x, y);
        pic.texture.repeat.set(w, h);
        if (pic.texture !== sprite.material.map) {
          sprite.material.map = pic.texture;
        }
      }
      sprite.scale.set(pw, ph, 1);
    }
    sprite.center.set(cx, cy);
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
      case Defines.ReservedFrameId.None:
      case Defines.ReservedFrameId.Self: return this.get_frame();
      case Defines.ReservedFrameId.Auto: return this.find_auto_frame();
      case Defines.ReservedFrameId.Gone: return GONE_FRAME_INFO as F;
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
        const { condition } = w;
        if (typeof condition !== 'function') {
          remains.push(w);
          continue;
        }
        if (condition(this)) {
          return this.get_next_frame(w);
        }
      }
      if (!remains.length) return [void 0, void 0];
      which = random_get(remains);
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
    if (is_positive_num(wait)) return this.wait;
    return frame.wait;
  }

  enter_frame(which: TNextFrame | string): void {
    const [frame, flags] = this.get_next_frame(which);
    if (!frame) {
      this._next_frame = void 0;
      Warn.print(constructor_name(this), 'enter_frame(which), next frame not found! which:', which);
      return
    }
    const { sound } = frame;
    const { x, y, z } = this.position;
    sound && this.world.lf2.sound_mgr.play(sound, x, y, z);
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
    if (this.wait > 0) { --this.wait; }
    else { this._next_frame = this._frame.next; }
    this.update_sprite_position();
  }

  dispose(): void {
    for (const f of this._disposers) f();
    this.sprite.removeFromParent();
  }
}
