import { Callbacks } from "../../LF2/base";
import { IMsgReqMap, IMsgRespMap, IPlayerInfo, IReq, IResp, IRespPlayerInfo, MsgEnum, TResp } from "../../Net";
import { IJob } from "./IJob";

export interface IConnectionCallbacks {
  once?: boolean;
  on_open?(conn: Connection): void;
  on_close?(e: CloseEvent, conn: Connection): void;
  on_register?(resp: IRespPlayerInfo, conn: Connection): void;
  on_error?(event: Event, conn: Connection): void;
  on_message(resp: TResp): void;
}

export interface ISendOpts {
  ignoreCode?: boolean;
  timeout?: number;
}

export class Connection {
  readonly callbacks = new Callbacks<IConnectionCallbacks>()
  protected _pid = 1;
  protected _reopen?: () => void;
  protected _jobs = new Map<string, IJob>();
  protected _ws: WebSocket | null = null;
  player?: IPlayerInfo;
  static TAG: string = 'Connection';

  protected _on_error = (e: Event) => this.callbacks.emit('on_error')(e, this)

  protected _on_open = () => {
    this.callbacks.emit('on_open')(this)
    this.send(MsgEnum.PlayerInfo, {}, {
      timeout: 1000
    }).then((resp) => {
      this.callbacks.emit('on_register')(resp, this)
      this.player = resp.player;
    }).catch((e) => {
      this.close();
      this.callbacks.emit('on_error',)
    })
  }
  protected _on_message = (event: MessageEvent<any>) => {
    console.log('收到服务器消息:', event.data);
    const resp = JSON.parse(event.data) as IResp;
    const { pid, code, error } = resp;
    const job = this._jobs.get(pid);
    if (!job) return;
    this._jobs.delete(pid);
    if (job.timerId) clearTimeout(job.timerId);
    this.callbacks.emit('on_message')(resp)
    if (code && !job.ignoreCode) {
      job.reject(new Error(`[${code}]${error}`));
    } else {
      job.resolve(resp);
    }
  }

  protected _on_close = (e: CloseEvent) => {
    this.callbacks.emit('on_close')(e, this)
    this._ws = null;
  }

  open(...args: ConstructorParameters<typeof WebSocket>) {
    switch (this._ws?.readyState) {
      case WebSocket.CONNECTING:
      case WebSocket.OPEN:
      case WebSocket.CLOSING:
        this._ws.close();
        if (this._reopen) this._ws.removeEventListener('close', this._reopen);
        this._reopen = () => this.open(...args)
        this._ws.addEventListener('close', this._reopen, { once: true });
        return;
    }
    this._reopen = void 0;
    this._ws = new WebSocket(...args);
    this._ws.addEventListener('message', this._on_message);
    this._ws.addEventListener('open', this._on_open);
    this._ws.addEventListener('close', this._on_close);
    this._ws.addEventListener('error', this._on_error);
  }

  close() {
    if (this._reopen) {
      this._ws?.removeEventListener('close', this._reopen);
      this._reopen = void 0
    }
    this._ws?.close()
    this._ws = null
  }


  send<
    T extends MsgEnum,
    Req extends IReq = IMsgReqMap[T],
    Resp extends IResp = IMsgRespMap[T]
  >(type: T, msg: Omit<Req, 'pid' | 'type'>, options?: ISendOpts): Promise<Resp> {
    if (!this._ws) return Promise.reject(new Error(`[${Connection.TAG}] not open`))
    const pid = `${++this._pid}`;
    const _req: IReq = { pid, type, ...msg };
    this._ws.send(JSON.stringify(_req));
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