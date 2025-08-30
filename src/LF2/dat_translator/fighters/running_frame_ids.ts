import { arithmetic_progression } from "../../utils";

export const running_frame_ids = arithmetic_progression(0, 3, 1).map(v => 'running_' + v);
