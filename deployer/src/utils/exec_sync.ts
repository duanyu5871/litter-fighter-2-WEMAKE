import { execSync } from 'child_process'
export const exec_sync = (cmd: string) => execSync(cmd).toString().trim();
