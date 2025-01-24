import { IObjectNode } from "../3d";
import { Defines } from "../defines";
import Ditto from "../ditto";
import { IQuaternion } from "../ditto/IQuaternion";
import Background from "../bg/Background";
import { BgLayerRender } from "./BgLayerRender";
import { World } from "../World";

interface BgRenderPack {
  readonly bg: Background | null;
  readonly mesh: IObjectNode | null;
  readonly layers: BgLayerRender[];
}
export class BgRender implements BgRenderPack {
  readonly world: World;
  private _bg: Background | null = null;
  private _mesh: IObjectNode | null = null;
  private _layers: BgLayerRender[] = [];
  private quaternion: IQuaternion;
  private old_packs = new Set<BgRenderPack>();
  get bg(): Background | null { return this._bg }
  get mesh(): IObjectNode | null { return this._mesh }
  get layers(): BgLayerRender[] { return this._layers }

  constructor(world: World) {
    this.world = world;
    this.quaternion = new Ditto.Quaternion()
  }

  private set_bg(bg: Background) {
    const { world } = this;
    const pack: BgRenderPack = {
      bg: this._bg,
      mesh: this._mesh,
      layers: [...this._layers]
    }
    this.old_packs.add(pack)
    pack.bg?.fade_out(250, 100, 0);
    setTimeout(() => {
      pack.mesh?.dispose()
      this.old_packs.delete(pack)
    }, 500)

    this._bg = bg;
    this._mesh = new Ditto.ObjectNode(world.lf2);
    this._mesh.z = -2 * Defines.CLASSIC_SCREEN_HEIGHT;
    this._mesh.name = Background.name + ":" + this._bg.data.base.name;
    this._layers.length = 0;
    this._bg.fade_in(250, 100, 350)

    for (const layer of bg.layers) {
      const layer_render = new BgLayerRender(layer)
      this._layers.push(layer_render);
      this._mesh.add(layer_render.mesh);
    }
    world.scene.add(this._mesh);
  }

  release() {
    this._mesh?.dispose();
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
      this.set_bg(this.world.bg)

    for (const pack of this.old_packs)
      this.render_pack(pack, true);

    this.render_pack(this);
  }
}
