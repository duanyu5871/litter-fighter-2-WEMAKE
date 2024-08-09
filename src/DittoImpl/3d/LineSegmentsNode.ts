import * as T from "three";
import { ILineSegmentsInfo, ILineSegmentsNode } from "../../LF2/3d";
import LF2 from "../../LF2/LF2";
import { __ObjectNode } from "./ObjectNode";

const geometry = new T.BufferGeometry();
const vertices = new Float32Array([
  0, 1, 1,
  1, 1, 1,
  1, 1, 1,
  1, 0, 1,
  1, 0, 1,
  0, 0, 1,
  0, 0, 1,
  0, 1, 1,
]);
geometry.setAttribute('position', new T.BufferAttribute(vertices, 3));

export class __LineSegmentsNode extends __ObjectNode implements ILineSegmentsNode {
  readonly is_line_segments_node = true;
  constructor(lf2: LF2, info?: ILineSegmentsInfo) {
    const material = new T.LineBasicMaterial(info);
    const inner = new T.LineSegments(geometry, material);
    super(lf2, inner)
  }
}
