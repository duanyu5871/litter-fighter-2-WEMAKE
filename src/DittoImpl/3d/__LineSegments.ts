import { Line2, LineGeometry, LineMaterial } from "./_t"
import { ILineSegmentsInfo, ILineSegmentsNode } from "../../LF2/3d";
import { LF2 } from "../../LF2/LF2";
import { __Object } from "./__Object";

const geometry = new LineGeometry();
const vertices = new Float32Array([
  0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 1, 1, 0, 1, 0, 0, 1, 0, 0, 1, 0, 1, 1,
]);
geometry.setPositions(vertices);

export class __LineSegments extends __Object implements ILineSegmentsNode {
  readonly is_line_segments_node = true;
  constructor(lf2: LF2, info?: ILineSegmentsInfo) {
    const material = new LineMaterial({ ...info, linewidth: 1 });
    const inner = new Line2(geometry, material);
    material.resolution.set(lf2.world.screen_w, lf2.world.screen_h);
    inner.computeLineDistances();
    super(lf2, inner);
  }
}
