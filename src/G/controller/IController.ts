import { TNextFrame } from "../../js_utils/lf2_type";

export type TKeyName = 'L' | 'R' | 'U' | 'D' | 'a' | 'j' | 'd'
export interface IController<Entity> {
  holding: Record<TKeyName, number>
  get LR(): -2 | -1 | 0 | 1 | 2;
  get UD(): -2 | -1 | 0 | 1 | 2;
  get LRUD(): boolean;
  get LR1(): -1 | 0 | 1;
  get UD1(): -1 | 0 | 1;

  character: Entity;

  dispose(): void;
  update(): TNextFrame | undefined;
}
