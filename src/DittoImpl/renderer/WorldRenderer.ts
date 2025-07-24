import type { IOrthographicCameraNode, IScene } from "../../LF2/3d";
import Ditto from "../../LF2/ditto";
import type { IBgRender } from "../../LF2/ditto/render/IBgRender";
import type { IEntityRenderer } from "../../LF2/ditto/render/IEntityRenderer";
import type { IFrameIndicators } from "../../LF2/ditto/render/IFrameIndicators";
import type { IWorldRenderer } from "../../LF2/ditto/render/IWorldRenderer";
import type { Entity } from "../../LF2/entity";
import { World } from "../../LF2/World";


export class WorldRenderer implements IWorldRenderer {
  get lf2() {
    return this.world.lf2;
  }
  world: World;
  bg_render: IBgRender;
  scene: IScene;
  camera: IOrthographicCameraNode;
  entity_renderer_packs = new Map<Entity, [
    IEntityRenderer, IEntityRenderer, IEntityRenderer, IFrameIndicators
  ]>();

  private _indicator_flags: number = 0;
  get indicator_flags() {
    return this._indicator_flags;
  }
  set indicator_flags(v: number) {
    if (this._indicator_flags === v) return;
    this._indicator_flags = v;
    for (const [, [, , , r4]] of this.entity_renderer_packs) {
      r4.flags = v;
    }
  }
  get cam_x(): number {
    return this.camera.x
  }
  set cam_x(v: number) {
    this.camera.x = v;
    for (const ui of this.lf2.ui_stacks) ui.renderer.x = v;
  }
  constructor(world: World) {
    this.world = world;
    const w = world.screen_w;
    const h = world.screen_h;
    this.bg_render = new Ditto.BgRender(world);
    this.scene = new Ditto.SceneNode(world.lf2).set_size(w * 4, h * 4);
    this.camera = new Ditto.OrthographicCamera(world.lf2)
      .setup(0, w, h, 0)
      .set_position(void 0, void 0, 10)
      .set_name("default_orthographic_camera")
      .apply();
    this.scene.add(this.camera);
  }
  add_entity(entity: Entity): void {
    const entity_renderer = new Ditto.EntityRender(entity);
    entity_renderer.on_mount();

    const shadow_renderer = new Ditto.EntityShadowRender(entity);
    shadow_renderer.on_mount()

    const info_renderer = new Ditto.EntityInfoRender(entity);
    info_renderer.on_mount()

    const frame_indicators = new Ditto.FrameIndicators(entity);
    frame_indicators.on_mount()

    this.entity_renderer_packs.set(entity, [
      entity_renderer, shadow_renderer, info_renderer, frame_indicators
    ]);
  }

  del_entity(e: Entity): void {
    const pack = this.entity_renderer_packs.get(e);
    if (!pack) return;
    const [r1, r2, r3, r4] = pack
    r1.on_unmount();
    r2.on_unmount();
    r3.on_unmount();
    r4.on_unmount();
    this.entity_renderer_packs.delete(e);
  }

  render(): void {
    const { indicator_flags } = this.world;
    if (indicator_flags != this.indicator_flags)
      this.indicator_flags = indicator_flags;
    this.bg_render.render();
    for (const [, [r1, r2, r3, r4]] of this.entity_renderer_packs) {
      r1.render();
      r2.render();
      r3.render();
      r4.render();
    }
    this.lf2.ui?.renderer.render()
    this.scene.render();
  }

  dispose() {
    this.scene.dispose();
    this.bg_render.release();
  }
}
