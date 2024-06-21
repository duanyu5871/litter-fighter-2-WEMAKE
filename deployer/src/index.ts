import { existsSync, readFileSync } from 'fs';
import { readFile } from 'fs/promises';
import Promises from './Promises';
import { get_cur_remote_branch_name } from './git/get_cur_remote_branch_name';
import { is_dirty } from './git/is_dirty';
import { app_error, app_log } from './utils/app_log';
import { check_remote_absolute_path } from './utils/check_remote_absolute_path';
import { get_arg_map } from './utils/get_arg_map';
import { get_path_collection } from './utils/get_path_collection';
import { get_short_file_size_txt } from './utils/get_short_file_size_txt';
import { is_str } from './utils/is_str';
import { progress_log, progress_log_end, progress_log_start } from './utils/progress_log';
import { ss2_log } from './utils/ss2_log';

let client: Promises.Client | null = null;
let sftp: Promises.SFTPWrapper | null = null;

async function main() {
  const arg_map = get_arg_map();

  const verbose = arg_map.has('-v') ? '-v' : '';
  const solution_names = arg_map.get('-s')?.split(',').filter(v => v);
  const config_json_path = arg_map.get('-p') ?? './deployer.config.json'
  const private_info_path = arg_map.get('-i') ?? './deployer.private.json'

  if (!existsSync(config_json_path))
    return app_error(`配置文件不存在, 参数: -p, 当前值:${config_json_path}`)

  if (!existsSync(config_json_path))
    return app_error(`私有信息文件不存在, 参数: -i, 当前值:${private_info_path}`)

  if (!solution_names?.length)
    return app_error("未指定打包配置, 参数: -s")

  for (const solution_name of solution_names) {
    const all_solutions = await readFile(config_json_path).then(buf => buf.toString()).then(str => JSON.parse(str))
    const all_private_infos = await readFile(private_info_path).then(buf => buf.toString()).then(str => JSON.parse(str))

    const solution = all_solutions[solution_name]
    if (!solution)
      return app_error(`未指定找到名为${solution_name}的配置,可用配置名: ${Object.keys(all_solutions).join(',')}`)

    const private_info = all_private_infos[solution_name]
    if (!private_info)
      return app_error(`未指定找到名为${solution_name}的私有信息，检查文件: ${private_info_path}`)

    const {
      SSH_HOST,
      SSH_PORT = '22',
      REMOTE_DIR,
      REMOTE_BACKUP_DIR,
      LOCAL_DIR,
      REMOTE_TMP_DIR,
      GIT_BRANCH,
      GIT_NO_BEHIND = true,
      GIT_NO_AHEAD = true,
      GIT_NO_DIRTY = true,
    } = solution

    const {
      SSH_USER = 'root',
      SSH_PASS,
      SSH_PRI_KEY_PATH,
      SSH_PRI_KEY_PASS,
    } = private_info

    if (GIT_BRANCH) {
      const [c_r_b_name, status] = get_cur_remote_branch_name()
      if (!c_r_b_name || !is_str(c_r_b_name))
        return app_error("无法获取当前git远端分支名");
      if (GIT_BRANCH !== c_r_b_name)
        return app_error('git分支不正确, 当前:', c_r_b_name, ",要求:", GIT_BRANCH);
      if (GIT_NO_BEHIND && status?.startsWith(': behind'))
        return app_error('git 不允许本地分支 < 远端分支')
      if (GIT_NO_AHEAD && status?.startsWith(': ahead'))
        return app_error('git 不允许本地分支 > 远端分支')
      if (GIT_NO_DIRTY && is_dirty())
        return app_error('git 不允许存在未提交代码')
    }

    if (!is_str(SSH_HOST)) return app_error('未指定 SSH_HOST');
    if (!is_str(SSH_PORT)) return app_error('未指定 SSH_PORT');
    if (!is_str(SSH_USER)) return app_error('未指定 SSH_USER');
    if (!is_str(REMOTE_DIR)) return app_error('未指定 REMOTE_DIR');
    if (!is_str(LOCAL_DIR)) return app_error('未指定 LOCAL_DIR');
    if (REMOTE_TMP_DIR) check_remote_absolute_path(REMOTE_TMP_DIR);
    check_remote_absolute_path(REMOTE_DIR)
    client = await new Promises.Client()
      .on('error', (e) => ss2_log('error', e))
      .on('timeout', () => ss2_log('timeout'))
      .on('end', () => ss2_log('end'))
      .on('greeting', v => ss2_log('greeting', v))
      .on('handshake', () => ss2_log('handshake'))
      .on('banner', v => ss2_log('banner', v))
      .on('close', () => ss2_log('close'))
      .on('connect', () => ss2_log('connect'))
      .on('ready', async () => ss2_log('ready'))
      .connect({
        host: SSH_HOST,
        port: Number(SSH_PORT),
        username: SSH_USER,
        privateKey: SSH_PRI_KEY_PATH ? readFileSync(SSH_PRI_KEY_PATH) : void 0,
        passphrase: SSH_PRI_KEY_PASS,
        password: SSH_PASS
      })

    if (REMOTE_BACKUP_DIR) {
      check_remote_absolute_path(REMOTE_BACKUP_DIR)
      const backup_dir_name = new Date().toISOString().replace(/-|:|T/g, '_').replace(/\.\d\d\dZ/g, '')
      const backup_full_path = `${REMOTE_BACKUP_DIR}/${backup_dir_name}`
      await client.sequence_exec(
        `mkdir -p ${backup_full_path} ${verbose}`, // 创建“备份目录”
        `cp -f -r ${REMOTE_DIR}/* ${backup_full_path} ${verbose}` // 将“目标目录”备份至“备份目录”
      )
    }
    const remote_tmp_path = REMOTE_TMP_DIR || `${REMOTE_DIR}_tmp`

    await client.exec(`rm -r -f ${remote_tmp_path} ${verbose}`) // 移除已存在的“临时目录”

    const {
      dir: local_dir_paths,
      file: local_file_paths,
      size: size_sum,
    } = get_path_collection(LOCAL_DIR)

    let file_idx = 0;
    sftp = await client.sftp()

    for (const local_dir_path of local_dir_paths) { // 创建目录
      const remote_dir_path = local_dir_path.replace(LOCAL_DIR, remote_tmp_path)
      await client.exec(`mkdir -p ${remote_dir_path} ${verbose}`)
    }

    app_log(`即将上传${local_file_paths.size}个文件，共${get_short_file_size_txt(size_sum)}`)
    try {
      progress_log_start(verbose);
      for (const path of local_file_paths) {
        const remote_path = path.replace(LOCAL_DIR, remote_tmp_path)
        const progress_txt = `[${++file_idx}/${local_file_paths.size}] sftp put "${path}" to "${remote_path}"`
        progress_log(verbose, progress_txt, `(0%)`)
        await sftp.fastPut(path, remote_path, {
          step: (total, _nb, fsize) => progress_log(verbose, progress_txt, `(${(100 * total / fsize).toFixed()}%)`)
        })
      }
    } catch (e) {
      throw e
    } finally {
      progress_log_end(verbose, "上传完毕");
    }

    await client.sequence_exec(
      `rm -r -f ${REMOTE_DIR} ${verbose}`, // 删除已存在的“目标目录”
      `mv ${remote_tmp_path} ${REMOTE_DIR} ${verbose}` // 将“临时目录”命名为“目标目录”
    )
  }
}

main().finally(() => {
  sftp?.end().destroy()
  client?.end().destroy()
});