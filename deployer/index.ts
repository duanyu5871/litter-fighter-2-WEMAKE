import { Client } from 'ssh2'
import { readFileSync } from 'fs'
import Promises from './Promises'
import { join } from 'path'
import { get_local_path_info } from './get_local_path_info'
require('dotenv').config()

const {
  SSH_HOST,
  SSH_PORT = '22',
  SSH_USER = 'root',
  SSH_PRIVATE_KEY_PATH = 'root',
  REMOTE_DIR,
  REMOTE_BACKUP_DIR,
  LOCAL_DIR
} = process.env

async function main() {
  if (!SSH_HOST) return console.error('未指定 SSH_HOST');
  if (!SSH_PORT) return console.error('未指定 SSH_PORT');
  if (!SSH_USER) return console.error('未指定 SSH_USER');
  if (!REMOTE_DIR) return console.error('未指定 REMOTE_DIR');
  if (!LOCAL_DIR) return console.error('未指定 LOCAL_DIR');

  if (REMOTE_DIR.indexOf('./') >= 0) return console.error('no');

  const client = new Client().on('error', (e) => {
    console.log('ssh2 client error', e)
  }).on('timeout', () => {
    console.log('ssh2 client timeout')
  }).on('end', () => {
    console.log('ssh2 client end')
  }).on('greeting', v => {
    console.log(v)
  }).on('handshake', v => {
    console.log('ssh2 client handshake...')
  }).on('banner', v => {
    console.log(v)
  }).on('close', () => {
    console.log('ssh2 client close')
  }).on('connect', () => {
    console.log('ssh2 client connect')
  }).on('ready', async () => {
    console.log('ssh2 client ready')

    let last_line = '';
    let last_line_prev_width = 0
    const print_last_line = (txt: string) => {
      last_line = txt
      // while (last_line.length < last_line_prev_width)
      //   last_line += ' '
      // last_line += '\r'
      last_line += '\n'
      last_line_prev_width = last_line.trimEnd().length;
      process.stdout.write(last_line);
    }

    const backup_dir_name = new Date().toISOString().replace(/-|:|T/g, '_').replace(/\.\d\d\dZ/g, '')
    const backup_full_path = `${REMOTE_BACKUP_DIR}/${backup_dir_name}`

    const tmp_path = `${REMOTE_DIR}_tmp`
    const local_path_info = get_local_path_info(LOCAL_DIR)
    const local_paths_len = local_path_info[1].size;
    let local_paths_idx = 0;

    await Promises.Client.shell(client)
    await Promises.Client.exec(client, `mkdir -p ${backup_full_path} -v`)
    await Promises.Client.exec(client, `cp -f -r ${REMOTE_DIR}/* ${backup_full_path} -v`)
    await Promises.Client.exec(client, `mkdir -p ${backup_full_path} -v`)
    await Promises.Client.exec(client, `rm -r -f ${tmp_path} -v`)

    const sftp = await Promises.Client.sftp(client)


    const [local_dir_paths, local_file_paths] = local_path_info
    for (const path of local_dir_paths) {
      const remote_path = path.replace(LOCAL_DIR, tmp_path)
      await Promises.Client.exec(client, `mkdir -p ${remote_path} -v`)
    }
    for (const path of local_file_paths) {
      const remote_path = path.replace(LOCAL_DIR, tmp_path)
      const progress_txt = `[${++local_paths_idx}/${local_paths_len}] sftp put "${path}" to "${remote_path}"`
      print_last_line(progress_txt)
      await Promises.SFTPWrapper.fastPut(sftp, path, remote_path, {
        step: (total, _nb, fsize) => print_last_line(`${progress_txt} (${total}/${fsize})`)
      })
    }

    await Promises.Client.exec(client, `rm -r -f ${REMOTE_DIR} -v`)
    await Promises.Client.exec(client, `mv ${tmp_path} ${REMOTE_DIR} -v`)
    sftp.end()
    sftp.destroy()
    client.end()
    client.destroy()
  }).connect({
    host: SSH_HOST,
    port: Number(SSH_PORT),
    username: SSH_USER,
    privateKey: SSH_PRIVATE_KEY_PATH ? readFileSync(SSH_PRIVATE_KEY_PATH) : void 0,
  })
}

main();