import type { IOrthographicCameraNode } from "../../3d";
import type { IScene } from "../../3d/IScene";
import type { Entity } from "../../entity/Entity";

export interface IWorldRenderer {
  cam_x: number;
  get scene(): IScene
  get camera(): IOrthographicCameraNode;
  indicator_flags: number;
  add_entity(entity: Entity): void;
  del_entity(entity: Entity): void;
  render(): void;
  dispose(): void;
}
