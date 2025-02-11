import type { Entity } from "../../entity";
import type { Stage } from "../../stage";

export interface IShadowRender {
  visible: boolean;
  on_mount(entity: Entity): void;
  on_unmount(entity: Entity): void;
  on_stage_change(stage: Stage): void;
}
