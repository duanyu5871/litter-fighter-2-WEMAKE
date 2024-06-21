import { exec_sync } from "../utils/exec_sync";
import { get_cur_local_branch_name } from "./get_cur_local_branch_name";


export const get_cur_remote_branch_name = () => {
  const l_b_name = get_cur_local_branch_name();
  const ret: [string | undefined, string | undefined] = [void 0, void 0]
  const result = exec_sync(`git branch -vv`)
    ?.split('\n')
    ?.find(v => v.startsWith(`* ${l_b_name}`))
    ?.match(/\[(.*?)(: .*?)?\]/);
  if (result) {
    ret[0] = result[1];
    ret[1] = result[2];
  }
  return ret
};