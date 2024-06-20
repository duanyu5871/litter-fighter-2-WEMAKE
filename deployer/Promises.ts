import type { Client, ClientChannel, SFTPWrapper, TransferOptions } from 'ssh2';

export namespace Promises {
  export namespace Client {
    export function exec(client: Client, cmd: string): Promise<number> {
      return new Promise((resolve, reject) => client.exec(cmd, (err, channel) => {
        if (err) return reject(err)
        channel.pipe(process.stdout, { end: true })
        channel.stderr.pipe(process.stderr, { end: true })
        channel.on('close', (code: any) => resolve(code))
      }));
    }
    export function shell(client: Client): Promise<ClientChannel> {
      return new Promise((resolve, reject) => client.shell(false, (err, channel) => {
        err ? reject(err) : resolve(channel);
      }));
    }
    export function sftp(client: Client): Promise<SFTPWrapper> {
      return new Promise((resolve, reject) => client.sftp((err, sftp) => {
        err ? reject(err) : resolve(sftp);
      }));
    }
  }
  export namespace ClientChannel {
    export function write(channel: ClientChannel, chunk: any): Promise<void> {
      return new Promise((resolve, reject) => channel.write(chunk, 'utf-8', (err) => {
        if (err) resolve();
        channel.once('drain', () => resolve())
      }));
    }
  }
  export namespace SFTPWrapper {
    export function fastPut(sftp: SFTPWrapper, local: string, remote: string, options?: TransferOptions): Promise<SFTPWrapper> {
      return new Promise((resolve, reject) => sftp.fastPut(local, remote, options ?? {}, (err) => {
        err ? reject(err) : resolve(sftp);
      }));
    }
  }
}
export default Promises