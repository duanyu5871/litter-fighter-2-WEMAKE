import { arithmetic_progression } from "../../utils";



export const standing_frame_ids = arithmetic_progression(0, 3, 1).map(v => '' + v);
