import { arithmetic_progression } from "../../utils";

export const walking_frame_ids = arithmetic_progression(0, 5, 1).map(v => 'walking_' + v);
