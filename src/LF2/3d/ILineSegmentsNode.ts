import { IObjectNode } from "./IObjectNode";

export interface ILineSegmentsInfo {
  color?: string | number;
  linewidth?: number;
}
export interface ILineSegmentsNode extends IObjectNode {
  readonly is_line_segments_node: true;
}
export const is_line_segments_node = (v: any): v is ILineSegmentsNode =>
  v.is_line_segments_node === true;
