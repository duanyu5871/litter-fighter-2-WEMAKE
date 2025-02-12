import type { Stage } from "../../stage";
/**
 * 场上物品的阴影
 */
export interface IShadowRender {
  get visible(): boolean;
  set visible(v: boolean);
  on_mount(): void;
  on_unmount(): void;
  on_stage_change?(stage: Stage): void;
  update(): void;
}
