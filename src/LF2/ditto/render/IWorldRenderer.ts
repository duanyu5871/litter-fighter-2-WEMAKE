import { ICamera } from "../../3d/ICamera";
import type { Entity } from "../../entity/Entity";

export interface IWorldRenderer {
  cam_x: number;
  get camera(): ICamera;
  indicator_flags: number;
  add_entity(entity: Entity): void;
  del_entity(entity: Entity): void;
  render(dt: number): void;
  dispose(): void;
}
