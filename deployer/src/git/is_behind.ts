import { exec_sync } from "../utils/exec_sync";

export const is_behind = (remote_branch_name: string) => !!exec_sync(`git log HEAD..${remote_branch_name} --oneline`);
