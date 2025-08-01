import { IJob } from "./IJob";
import { IResp, IReq } from "../../net_msg_definition";

export class Connection {
  private _pid = 1;
  private _jobs = new Map<string, IJob>();
  readonly inner: WebSocket;

  constructor(...args: ConstructorParameters<typeof WebSocket>) {
    this.inner = new WebSocket(...args);
    this.inner.onmessage = this.onmessage.bind(this);
    this.inner.onopen = this.onopen.bind(this);
  }
  
  onopen() {

  }

  onmessage(event: MessageEvent<any>) {
    console.log('收到服务器消息:', event.data);
    const resp = JSON.parse(event.data) as IResp;
    const { pid, code, error } = resp;
    const job = this._jobs.get(pid);
    if (!job) return;
    this._jobs.delete(pid);
    if (job.timerId) clearTimeout(job.timerId);
    if (code && !job.ignoreCode) {
      job.reject(new Error(`[${code}]${error}`));
    } else {
      job.resolve(resp);
    }
  }

  send<Req extends IReq = IReq, Resp extends IResp = IResp>(msg: Omit<Req, 'pid'>, options?: { ignoreCode?: boolean; timeout?: number; }): Promise<Resp> {
    const pid = `${++this._pid}`;
    const _req: IReq = { pid, ...msg };
    this.inner.send(JSON.stringify(_req));
    return new Promise<Resp>((resolve, reject) => {
      this._jobs.set(pid, { resolve: resolve as any, reject, ...options });
      const timeout = options?.timeout || 0;
      if (timeout > 0) {
        setTimeout(() => {
          this._jobs.delete(pid);
          reject(new Error(`timeout! over ${timeout}`));
        }, timeout);
      }
    });
  }
}
