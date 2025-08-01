
import { useRef, useState } from "react";
import { Button } from "../../Component/Buttons/Button";
import { IReq, IReqRegister, IResp, MsgEnum } from "../../net_msg_definition";

interface IJob {
  resolve(r: IResp): void,
  reject(e: any): void,
  timerId?: number,
  ignoreCode?: boolean
}
class Connection {
  private _pid = 1;
  private _jobs = new Map<string, IJob>();
  readonly inner: WebSocket;

  constructor(...args: ConstructorParameters<typeof WebSocket>) {
    this.inner = new WebSocket(...args);
    this.inner.onmessage = this.onmessage.bind(this);
  }
  
  onmessage(event: MessageEvent<any>) {
    console.log('收到服务器消息:', event.data);
    const resp = JSON.parse(event.data) as IResp;
    const { pid, code, error } = resp;
    const job = this._jobs.get(pid);
    if (!job) return;
    this._jobs.delete(pid);
    if (job.timerId) clearTimeout(job.timerId)
    if (code && !job.ignoreCode) {
      job.reject(new Error(`[${code}]${error}`))
    } else {
      job.resolve(resp)
    }
  }

  send<Req extends IReq = IReq>(msg: Omit<Req, 'pid'>, options?: { ignoreCode?: boolean, timeout?: number }): Promise<IResp> {
    const pid = `${++this._pid}`
    const _req: IReq = { pid, ...msg }
    this.inner.send(JSON.stringify(_req));
    return new Promise<IResp>((resolve, reject) => {
      this._jobs.set(pid, { resolve, reject, ...options })
      const timeout = options?.timeout || 0
      if (timeout > 0) {
        setTimeout(() => {
          this._jobs.delete(pid)
          reject(new Error(`timeout! over ${timeout}`))
        }, timeout)
      }
    })
  }
}

export default function NetworkTest() {
  const [connected, set_connected] = useState(false);
  const [connecting, set_connecting] = useState(false);

  const ref_ws = useRef<Connection | null>(null)
  function disconnect() {
    const ws = ref_ws.current
    if (!ws) return;
    ws.inner.close();
    set_connected(false);
    set_connecting(false);
    ref_ws.current = null
  }
  function connect() {
    if (ref_ws.current) return;
    const ws = ref_ws.current = new Connection('ws://localhost:8080');
    ws.inner.onopen = () => {
      console.log('已连接到服务器');
      set_connected(true);
      set_connecting(false);
    };

    ws.inner.onclose = () => {
      console.log('与服务器的连接已关闭');
      disconnect()
    };
    ws.inner.onerror = (err) => {
      console.error('连接错误:', err);
      disconnect()
    };
  }
  function register() {
    const ws = ref_ws.current
    if (!ws) return;
    ws.send<IReqRegister>({ type: MsgEnum.Register, name: 'player_1' }).then(() => {
      console.log('ok!')
    }).catch(e => {

    })
  }
  return (
    <>
      <Button disabled={!connected && connecting} onClick={connected ? disconnect : connect}>
        {connecting ? 'connecting...' : connected ? 'disconnect' : 'connect'}
      </Button>
      <Button disabled={!connected && connecting} onClick={register}>
        register
      </Button>
    </>
  )
}
