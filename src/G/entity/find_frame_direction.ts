/* eslint-disable eqeqeq */
import { IFrameInfo, TFrameIdListPair, TFrameIdPair } from "../../js_utils/lf2_type";

export default function find_direction(f: IFrameInfo, pair: TFrameIdListPair | TFrameIdPair): 1 | -1 | 0 {
  const { '-1': a, '1': b } = pair;
  if (a == f.id || (Array.isArray(a) && a.findIndex(v => v == f.id) >= 0)) return -1;
  if (b == f.id || (Array.isArray(b) && b.findIndex(v => v == f.id) >= 0)) return 1;
  return 0;
}