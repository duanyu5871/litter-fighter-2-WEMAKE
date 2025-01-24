import { World } from "../World";
import { IBgData } from "../defines";
import { IBgLayerInfo } from "../defines/IBgLayerInfo";
import Layer from "./Layer";

export default class Background {

  readonly data: Readonly<IBgData>;
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
  }

  private add_layer(info: IBgLayerInfo) {
    let { x, loop = 0 } = info;
    do {
      this._layers.push(
        new Layer(this, { ...info, x })
      );
      x += loop
    } while (loop > 0 && x < this.width);
  }

  fade_out(duration: number, delay_max_offset: number, delay: number): void {
    for (const layer of this._layers)
      layer.fade_out(duration, Math.random() * delay_max_offset + delay);
  }

  fade_in(duration: number, delay_max_offset: number, delay: number): void {
    for (const layer of this._layers)
      layer.fade_in(duration, Math.random() * delay_max_offset + delay);
  }

  update() {
    this._update_times++;
    for (const layer of this._layers)
      layer.update(this._update_times);
  }

  dispose() {
    for (const layer of this._layers)
      layer.dispose()
    this._layers.length = 0
  }
}

