import { Callbacks } from "../../LF2/base";
import { ErrCode, IMsgReqMap, IMsgRespMap, IPlayerInfo, IReq, IResp, IRespPlayerInfo, MsgEnum, TResp } from "../../Net";
import { IJob } from "./IJob";

export interface IConnectionCallbacks {
  once?: boolean;
  on_open?(conn: Connection): void;
  on_close?(e: CloseEvent, conn: Connection): void;
  on_register?(resp: IRespPlayerInfo, conn: Connection): void;
  on_error?(error: ConnError, conn: Connection): void;
  on_message(resp: TResp, conn: Connection): void;
}

export interface ISendOpts {
  ignoreCode?: boolean;
  timeout?: number;
}
export type ConnError = Error & {
  type: MsgEnum | string,
  code: ErrCode | number,
  error: string
}
export function resp_error(resp: IResp): ConnError {
  const code = resp.code ?? ErrCode.Unknown;
  const info = resp.error ?? 'unknown error';
  return Object.assign(new Error(`[${code}]${info}`), {
    type: resp.type ?? 'unknown',
    code: code,
    error: info
  })
}
export function req_timeout_error(req: IReq, timeout: number): ConnError {
  const code = ErrCode.Timeout;
  const info = `timeout! over ${timeout}ms`;
  return Object.assign(new Error(`[${code}]${info}`), {
    type: req.type,
    pid: req.pid,
    code: code,
    error: info
  })
}
export function req_unknown_error(req: IReq, error: Error): ConnError {
  const code = ErrCode.Unknown;
  const info = `unknown error`;
  return Object.assign(error, {
    type: req.type,
    pid: req.pid,
    code: code,
    error: info
  })
}
export function unknown_error(req: IReq, error: Error): ConnError {
  const code = ErrCode.Unknown;
  const info = `unknown error`;
  return Object.assign(error, {
    type: req.type,
    pid: req.pid,
    code: code,
    error: info
  })
}
export class Connection {
  static TAG: string = 'Connection';
  readonly callbacks = new Callbacks<IConnectionCallbacks>()
  protected _pid = 1;
  protected _reopen?: () => void;
  protected _jobs = new Map<string, IJob>();
  protected _ws: WebSocket | null = null;
  player?: IPlayerInfo;


  protected _on_open = () => {
    this.callbacks.emit('on_open')(this)
    this.send(MsgEnum.PlayerInfo, {}, {
      timeout: 1000
    }).then((resp) => {
      this.player = resp.player;
      this.callbacks.emit('on_register')(resp, this)
    }).catch((e) => {
      this.close();
      throw e;
    })
  }
  protected _on_message = (event: MessageEvent<any>) => {
    console.log('收到服务器消息:', event.data);
    const resp = JSON.parse(event.data) as IResp;
    const { pid, code, error } = resp;
    const job = this._jobs.get(pid);
    const err = code ? resp_error(resp) : void 0
    if (err) this.callbacks.emit('on_error')(err, this)
    else this.callbacks.emit('on_message')(resp, this)

    if (!job) return;
    this._jobs.delete(pid);
    if (job.timerId) clearTimeout(job.timerId);
    if (code && !job.ignoreCode) {
      job.reject(err);
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
    // this._ws.addEventListener('error', this._on_error);
  }

  close() {
    if (this._reopen) {
      this._ws?.removeEventListener('close', this._reopen);
      this._reopen = void 0
    }
    this._ws?.close()
    this._ws?.removeEventListener('message', this._on_message);
    this._ws?.removeEventListener('open', this._on_open);
    this._ws?.removeEventListener('close', this._on_close);
    this._ws = null
  }


  send<
    T extends MsgEnum,
    Req extends IReq = IMsgReqMap[T],
    Resp extends IResp = IMsgRespMap[T]
  >(type: T, msg: Omit<Req, 'pid' | 'type'>, options?: ISendOpts): Promise<Resp> {
    const ws = this._ws;
    if (!ws) return Promise.reject(new Error(`[${Connection.TAG}] not open`))
    const pid = `${++this._pid}`;
    const _req: IReq = { pid, type, ...msg };
    return new Promise<Resp>((resolve, reject) => {
      const timeout = options?.timeout || 0;
      const timerId = timeout > 0 ? window.setTimeout(() => {
        this._jobs.delete(pid);
        const error = req_timeout_error(_req, timeout)
        this.callbacks.emit('on_error')(error, this)
        reject(error);
      }, timeout) : void 0;

      this._jobs.set(pid, { resolve: resolve as any, timerId, reject, ...options });
      try {
        ws.send(JSON.stringify(_req));
      } catch (e) {
        clearTimeout(timerId)
        const error = req_unknown_error(_req, e as Error)
        this.callbacks.emit('on_error')(error, this)
        reject(error)
      }
    });
  }
}