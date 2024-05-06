import * as THREE from 'three';
import LF2 from '../../LF2/LF2';
import { IStyle } from '../../LF2/loader/IStyle';
import { create_picture } from '../../LF2/loader/loader';

export class TextBuilder {
  protected lf2: LF2;
  protected _x: number = 0;
  protected _y: number = 0;
  protected _cx: number = 0.5;
  protected _cy: number = 0.5;
  protected _text: string = '';
  protected _style: IStyle = {};
  protected constructor(lf2: LF2) {
    this.lf2 = lf2;
  }

  static get(lf2: LF2) {
    return new TextBuilder(lf2);
  }

  center(x: number, y: number): this {
    this._cx = x;
    this._cy = y;
    return this;
  }
  pos(x: number, y: number): this {
    this._x = x;
    this._y = y;
    return this;
  }

  text(v: string): this {
    this._text = v;
    return this;
  }

  style(v: IStyle): this {
    this._style = v;
    return this;
  }

  async build_mesh() {
    const [geo, tex] = await this.build();
    const material = new THREE.MeshBasicMaterial({ transparent: true, map: tex });
    const ret = new THREE.Mesh(geo, material)
    ret.position.x = this._x;
    ret.position.y = this._y;
    return ret;
  }

  async build() {
    const img = await this.lf2.img_mgr.load_text(this._text, this._style);
    const tex = create_picture(img.key, img).data.texture
    const geo = new THREE.PlaneGeometry(img.w, img.h).translate(img.w * (0.5 - this._cx), img.h * (this._cy - 0.5), 0);
    return [geo, tex] as const;
  }
}
