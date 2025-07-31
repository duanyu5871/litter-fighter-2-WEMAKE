import type { IOrthographicCameraNode } from "../../3d";
import type { Entity } from "../../entity/Entity";

export interface IWorldRenderer {
  cam_x: number;
  get camera(): IOrthographicCameraNode;
  indicator_flags: number;
  add_entity(entity: Entity): void;
  del_entity(entity: Entity): void;
  render(): void;
  dispose(): void;
}
