import { exec_sync } from "../utils/exec_sync";

export const get_cur_local_branch_name = () => exec_sync('git branch --show-current');
