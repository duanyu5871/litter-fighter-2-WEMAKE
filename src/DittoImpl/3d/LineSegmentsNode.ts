import * as T from "three";
import { Line2 } from "three/examples/jsm/lines/Line2";
import { LineGeometry } from "three/examples/jsm/lines/LineGeometry";
import { LineMaterial } from "three/examples/jsm/lines/LineMaterial";
import { ILineSegmentsInfo, ILineSegmentsNode } from "../../LF2/3d";
import LF2 from "../../LF2/LF2";
import { __ObjectNode } from "./ObjectNode";

const geometry = new LineGeometry();
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
geometry.setPositions(vertices);

export class __LineSegmentsNode extends __ObjectNode implements ILineSegmentsNode {
  readonly is_line_segments_node = true;
  constructor(lf2: LF2, info?: ILineSegmentsInfo) {
    const material = new LineMaterial({ ...info, linewidth: 1 });
    const inner = new Line2(geometry, material);
    material.resolution.set(
      lf2.world.screen_w, 
      lf2.world.screen_h
    )
    inner.computeLineDistances()
    super(lf2, inner)
  }
}
