import { exec_sync } from "../utils/exec_sync";

export const is_dirty = () => !!exec_sync(`git status --short`);
