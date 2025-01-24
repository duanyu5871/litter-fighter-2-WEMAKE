import { World } from "../World";
import { IBgData } from "../defines";
import { IBgLayerInfo } from "../defines/IBgLayerInfo";
import { TPicture } from "../loader/loader";
import { BgRender } from "../renderer/BgRender";
import Layer from "./Layer";

export default class Background {
  readonly data: Readonly<IBgData>;
  private _disposers: (() => void)[] = [];
  private _layers: Layer[] = [];

  get id(): string {
    return this.data.id;
  }
  get left(): number {
    return this.data.base.left;
  }
  get right(): number {
    return this.data.base.right;
  }
  get near(): number {
    return this.data.base.near;
  }
  get far(): number {
    return this.data.base.far;
  }
  get layers(): ReadonlyArray<Layer> {
    return this._layers;
  }
  readonly width: number;
  readonly depth: number;

  readonly middle: { x: number; z: number };
  readonly world: World;
  private _update_times = 0;

  readonly render: BgRender;

  constructor(world: World, data: IBgData) {
    this.data = data;
    this.world = world;

    this.width = this.data.base.right - this.data.base.left;
    this.depth = this.data.base.near - this.data.base.far;
    this.middle = {
      x: (this.data.base.right + this.data.base.left) / 2,
      z: (this.data.base.far + this.data.base.near) / 2,
    };
    for (const info of data.layers)
      this.add_layer(info);
    this.render = new BgRender(this);
    this._disposers.push(() => this.fade_out());
  }

  private add_layer(info: IBgLayerInfo) {
    let { x, loop = 0 } = info;
    do {
      this._layers.push(
        new Layer(this, { ...info, x: x += loop })
      );
    } while (loop > 0 && x < this.width);
  }

  fade_out(): void {
    const max_delay = 50;
    const duration = 120;
    for (const layer of this._layers) {
      layer.fade_out(250, Math.random() * max_delay);
    }
    setTimeout(() => {
      this.render.release();
    }, duration + max_delay);
  }
  get_shadow(): TPicture {
    return this.world.lf2.images.create_pic_by_img_key(this.data.base.shadow);
  }

  dispose() {
    this._disposers.forEach(f => f());
  }
  update() {
    this._update_times++;
    for (const layer of this._layers)
      layer.update(this._update_times);
    this.render.render();
  }
}

