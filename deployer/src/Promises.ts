import * as ssh2 from 'ssh2';

export namespace Promises {
  export abstract class Wrapper<T> {
    protected _i: T;
    get i() { return this._i; }
    constructor(i: T) { this._i = i }
  }

  export class Client extends Wrapper<ssh2.Client> {

    constructor(inner: ssh2.Client);
    constructor(...args: ConstructorParameters<typeof ssh2.Client>);
    constructor(...args: any[]) {
      const i = typeof args[0] === 'function' ? args[0] : new ssh2.Client(...args)
      super(i)
    }
    on(event: "greeting", listener: (greeting: string) => void): this;
    on(event: "handshake", listener: (negotiated: ssh2.NegotiatedAlgorithms) => void): this;
    on(event: "connect", listener: () => void): this;
    on(event: "timeout", listener: () => void): this;
    on(event: "close", listener: () => void): this;
    on(event: "end", listener: () => void): this;
    on(event: "error", listener: (err: Error & ssh2.ClientErrorExtensions) => void): this;
    on(event: "banner", listener: (message: string) => void): this;
    on(event: "ready", listener: () => void): this;
    on(a: any, b: any): this { this._i.on(a, b); return this; }
    once(a: any, b: any): this { this._i.once(a, b); return this; }
    off(a: any, b: any): this { this._i.off(a, b); return this; }

    exec(command: string): Promise<number> {
      return new Promise((resolve, reject) => this._i.exec(command, (err, channel) => {
        if (err) return reject(err)
        channel.pipe(process.stdout, { end: true })
        channel.stderr.pipe(process.stderr, { end: true })
        channel.on('close', (code: any) => resolve(code))
      }));
    }
    async sequence_exec(...commands: string[]): Promise<number[]> {
      const ret: number[] = []
      for (const cmd of commands)
        ret.push(await this.exec(cmd))
      return ret;
    }
    sftp(): Promise<SFTPWrapper> {
      return new Promise((resolve, reject) => this._i.sftp((err, sftp) => {
        err ? reject(err) : resolve(new SFTPWrapper(sftp));
      }));
    }
    end() { return this._i.end() }
    destroy() { return this._i.destroy() }

    connect(config: ssh2.ConnectConfig): Promise<this> {
      return new Promise((resolve, reject) => {
        this.i.once('ready', () => resolve(this))
        this.i.once('error', e => reject(e))
        this.i.once('timeout', () => reject(new Error('ssh2 timeout')))
        this.i.connect(config)
      })
    }
  }

  export class SFTPWrapper extends Wrapper<ssh2.SFTPWrapper> {
    fastPut(local: string, remote: string, options?: ssh2.TransferOptions): Promise<SFTPWrapper> {
      return new Promise((resolve, reject) => this._i.fastPut(local, remote, options ?? {}, (err) => {
        err ? reject(err) : resolve(this);
      }));
    }
    end() { this._i.end(); return this; }
    destroy() { this._i.destroy(); return this; }
  }

}
export default Promises