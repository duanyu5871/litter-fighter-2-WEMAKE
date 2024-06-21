import { readFileSync } from 'fs';
import { readFile } from 'fs/promises';
import Promises from './Promises';
import { app_log, app_log_error } from './utils/app_log';
import { check_remote_absolute_path } from './utils/check_remote_absolute_path';
import { get_path_collection } from './utils/get_path_collection';
import { get_short_file_size_txt } from './utils/get_short_file_size_txt';
import { is_str } from './utils/is_str';
import { progress_log, progress_log_end, progress_log_start } from './utils/progress_log';
import { ss2_log } from './utils/ss2_log';

let client: Promises.Client | null = null;
let sftp: Promises.SFTPWrapper | null = null;
const verbose = process.argv.indexOf('-v') >= 0 ? '-v' : '';

async function main() {
  const { release } = await readFile('./deployer.config.json').then(buf => buf.toString()).then(str => JSON.parse(str))
  const {
    SSH_HOST,
    SSH_PORT = '22',
    SSH_USER = 'root',
    SSH_PASS,
    SSH_PRI_KEY_PATH,
    REMOTE_DIR,
    REMOTE_BACKUP_DIR,
    LOCAL_DIR,
    REMOTE_TMP_DIR,
    SSH_PRI_KEY_PASS
  } = release

  if (!is_str(SSH_HOST)) return app_log_error('未指定 SSH_HOST');
  if (!is_str(SSH_PORT)) return app_log_error('未指定 SSH_PORT');
  if (!is_str(SSH_USER)) return app_log_error('未指定 SSH_USER');
  if (!is_str(REMOTE_DIR)) return app_log_error('未指定 REMOTE_DIR');
  if (!is_str(LOCAL_DIR)) return app_log_error('未指定 LOCAL_DIR');

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
    progress_log_end(verbose);
  }

  await client.sequence_exec(
    `rm -r -f ${REMOTE_DIR} ${verbose}`, // 删除已存在的“目标目录”
    `mv ${remote_tmp_path} ${REMOTE_DIR} ${verbose}` // 将“临时目录”命名为“目标目录”
  )
}

main().finally(() => {
  sftp?.end().destroy()
  client?.end().destroy()
});