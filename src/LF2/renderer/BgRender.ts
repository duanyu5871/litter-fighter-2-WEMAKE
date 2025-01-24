import { IObjectNode } from "../3d";
import { Defines } from "../defines";
import Ditto from "../ditto";
import { IQuaternion } from "../ditto/IQuaternion";
import Background from "../bg/Background";
import { BgLayerRender } from "./BgLayerRender";


export class BgRender {
  readonly bg: Background;
  readonly obj_3d: IObjectNode;
  private _q: IQuaternion;
  readonly layer_renders: BgLayerRender[] = [];

  constructor(bg: Background) {
    this.bg = bg;
    const { world } = bg;
    this._q = new Ditto.Quaternion()

    this.obj_3d = new Ditto.ObjectNode(world.lf2);
    this.obj_3d.z = -2 * Defines.CLASSIC_SCREEN_HEIGHT;
    this.obj_3d.name = Background.name + ":" + this.bg.data.base.name;

    for (const layer of bg.layers) {
      const layer_render = new BgLayerRender(layer)
      this.layer_renders.push(layer_render);
      this.obj_3d.add(layer_render.mesh);
    }

    world.scene.add(this.obj_3d);
  }

  release() {
    this.obj_3d.del_self();
  }

  render() {
    this.bg.world.camera.world_quaternion(this._q);
    this.obj_3d.rotation_from_quaternion(this._q);
    for (const layer_render of this.layer_renders) {
      layer_render.render();
    }
  }
}
