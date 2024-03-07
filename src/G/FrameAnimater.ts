import * as THREE from 'three';
import random_get from '../Utils/random_get';
import type { World } from './World';
import create_pictures from './loader/create_pictures';
import { IFrameInfo, INextFrameFlags, ITexturePieceInfo, IGameObjData, TFace, TFrameId, TNextFrame, INextFrame } from '../js_utils/lf2_type';
import { IPictureInfo } from '../types/IPictureInfo';
import { sound_mgr } from './loader/SoundMgr';
export type T_NEXT_FRAME = readonly [IFrameInfo, INextFrameFlags | undefined]
export type T_VOID_NEXT_FRAME = readonly [undefined, undefined]
export const NO_NEXT_FRAME: T_VOID_NEXT_FRAME = [undefined, undefined];
export const EMPTY_PIECE: ITexturePieceInfo = {
  tex: 0, x: 0, y: 0, w: 0, h: 0, cx: 0, cy: 0,
  ph: 0, pw: 0,
}
export const EMPTY_FRAME_INFO: IFrameInfo = {
  id: '',
  name: '',
  pic: 0,
  state: NaN,
  wait: 0,
  next: { id: '' },
  centerx: 0,
  centery: 0
};
export const GONE_FRAME_INFO: IFrameInfo = {
  id: 'gone',
  name: 'GONE_FRAME_INFO',
  pic: 0,
  state: 0,
  wait: 0,
  next: { id: '' },
  centerx: 0,
  centery: 0
};


export class FrameAnimater<D extends IGameObjData = IGameObjData> {
  id: string = '';
  wait: number = 0;

  readonly data: D;
  readonly world: World;
  readonly pictures: Map<string, IPictureInfo<THREE.Texture>>;
  readonly sprite: THREE.Sprite;
  readonly position = new THREE.Vector3(0, 0, 0);

  protected _piece: ITexturePieceInfo = EMPTY_PIECE;
  protected _face: TFace = 1;
  private _frame: D['frames'][0] = EMPTY_FRAME_INFO;
  private _prev_frame: D['frames'][0] = EMPTY_FRAME_INFO;

  get face() { return this._face; }
  set face(v: TFace) {
    if (this._face === v) { return; }
    this._face = v;
    this.update_sprite();
  }

  set_frame(v: D['frames'][0]) {
    this._prev_frame = this._frame
    this._frame = v;
  }
  get_frame() { return this._frame; }
  get_prev_frame() { return this._prev_frame; }

  constructor(world: World, data: D) {
    this.data = data;
    this.world = world;
    this.pictures = create_pictures(data);

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
    this.update_sprite_position();
    this.update_sprite();
    this.world.add_game_objs(this);
    return this;
  }
  private _previous = {
    face: (void 0) as TFace | undefined,
    frame: (void 0) as D['frames'][0] | undefined,
  }
  protected update_sprite() {
    const frame = this.get_frame();
    if (
      this._previous.face === this._face &&
      this._previous.frame === this._frame
    ) {
      return;
    }
    this._previous.face = this._face;
    this._previous.frame = this._frame;

    const sprite = this.sprite;
    const piece = frame.pic;
    if (typeof piece === 'number' || !('1' in piece)) {
      return;
    }
    const { cx, cy } = piece[this._face];
    if (this._piece !== piece[this._face]) {
      const { x, y, w, h, tex, pw, ph } = this._piece = piece[this._face];
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

  }

  find_auto_frame(): D['frames'][0] {
    console.warn('[FrameAnimater] find_auto_frame(): auto frame not set!');
    return this.get_frame();
  }

  find_frame_by_id(id: TFrameId): D['frames'][0] {
    if (id === 'self' || id === '') return this.get_frame();
    else if (id === 'auto') return this.find_auto_frame();
    else if (id === 'gone') return GONE_FRAME_INFO
    else return this.data.frames[id] ?? EMPTY_FRAME_INFO;
  }

  get_next_frame(which: TNextFrame | TFrameId): T_NEXT_FRAME | T_VOID_NEXT_FRAME {
    if (typeof which === 'string' || typeof which === 'number') {
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
      if (!remains.length) return NO_NEXT_FRAME;
      which = random_get(remains);
      return this.get_next_frame(which);
    }
    let { id } = which;
    if (Array.isArray(id)) id = random_get(id);
    const frame = this.find_frame_by_id(id);
    return [frame, which.flags];
  }

  handle_next_frame_flags(flags: INextFrameFlags | undefined) {
    switch (flags?.turn) {
      case 1: this._face *= -1; break;
      case 3: this._face = -1; break;
      case 4: this._face = 1; break;
    }
  }

  enter_frame(which: TNextFrame | TFrameId): void {
    const [frame, flags] = this.get_next_frame(which);
    if (!frame) return console.warn('[FrameAnimater] frame not found! which:', which);
    const { sound, wait } = frame;
    const { x, y, z } = this.position;
    sound && sound_mgr.play(sound, x, y, z);
    this.set_frame(frame);

    const next_wait = flags?.wait;
    if (next_wait === 'i') { // 不必做什么，继承上一帧的wait
    } else if (typeof next_wait === 'number') {
      this.wait = next_wait;
    } else if (!next_wait) {
      this.wait = wait;
    }
    this.handle_next_frame_flags(flags);
    this.update_sprite();
  }

  goto_next_frame_when_need() {
    const old = this.get_frame();
    if (old && !this.wait)
      this.enter_frame(old.next);
    return [old, this.get_frame()] as const;
  }

  update() {
    this.goto_next_frame_when_need();
    this.update_sprite_position();
    if (this.wait > 0) --this.wait;
  }

  dispose(): void { }
}
