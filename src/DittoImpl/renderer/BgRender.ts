import type { IObjectNode } from "../../LF2/3d";
import type Background from "../../LF2/bg/Background";
import { Defines, type IQuaternion } from "../../LF2/defines";
import Ditto from "../../LF2/ditto";
import type { IBgRender } from "../../LF2/ditto/render/IBgRender";
import type { World } from "../../LF2/World";
import { BgLayerRender } from "./BgLayerRender";

interface BgRenderPack {
  readonly bg: Background | null;
  readonly mesh: IObjectNode | null;
  readonly layers: BgLayerRender[];
}
export class BgRender implements BgRenderPack, IBgRender {
  readonly world: World;
  private _bg: Background | null = null;
  private _mesh: IObjectNode | null = null;
  private _layers: BgLayerRender[] = [];
  private quaternion: IQuaternion;
  private old_packs = new Set<BgRenderPack>();
  get bg(): Background | null { return this._bg }
  set bg(v: Background | null) { this.set_bg(v) }
  get mesh(): IObjectNode | null { return this._mesh }
  get layers(): BgLayerRender[] { return this._layers }

  constructor(world: World) {
    this.world = world;
    this.quaternion = new Ditto.Quaternion()
  }

  private set_bg(bg: Background | null) {
    const { world } = this;
    const pack: BgRenderPack = {
      bg: this._bg,
      mesh: this._mesh,
      layers: [...this._layers]
    }
    this.old_packs.add(pack)
    pack.bg?.fade_out(16, 6, 0);
    setTimeout(() => {
      pack.mesh?.dispose()
      this.old_packs.delete(pack)
    }, 500)

    this._bg = bg;
    if (this._bg) {
      this._mesh = new Ditto.ObjectNode(world.lf2);
      this._mesh.z = -2 * Defines.CLASSIC_SCREEN_HEIGHT;
      this._layers.length = 0;
      this._mesh.name = "Background:" + this._bg.data.base.name;
      this._bg.fade_in(16, 6, 21)
      for (const layer of this._bg.layers) {
        const layer_render = new BgLayerRender(layer)
        this._layers.push(layer_render);
        this._mesh.add(layer_render.mesh);
      }
      world.scene.add(this._mesh);
    }
  }

  private render_pack({ bg, mesh, layers }: BgRenderPack, with_update = false) {
    if (with_update) bg?.update()
    bg?.world.camera.world_quaternion(this.quaternion);
    mesh?.rotation_from_quaternion(this.quaternion);
    for (const render of layers)
      render.update();
  }

  update() {
    if (this._bg !== this.world.bg)
      this.bg = this.world.bg

    for (const pack of this.old_packs)
      this.render_pack(pack, true);

    this.render_pack(this);
  }

  release() {
    this._mesh?.dispose();
  }
}
