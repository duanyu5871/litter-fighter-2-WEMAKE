
import { useRef, useState } from "react";
import { Button } from "../../Component/Buttons/Button";
import Combine from "../../Component/Combine";
import { Input } from "../../Component/Input";
import Show from "../../Component/Show";
import { Space } from "../../Component/Space";
import { Text } from "../../Component/Text";
import { IReq, IReqCreateRoom, IReqJoinRoom, IReqRegister, IResp, IRespCreateRoom, IRespJoinRoom, IRoomInfo, MsgEnum } from "../../net_msg_definition";

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

  send<Req extends IReq = IReq, Resp extends IResp = IResp>(msg: Omit<Req, 'pid'>, options?: { ignoreCode?: boolean, timeout?: number }): Promise<Resp> {
    const pid = `${++this._pid}`
    const _req: IReq = { pid, ...msg }
    this.inner.send(JSON.stringify(_req));
    return new Promise<Resp>((resolve, reject) => {
      this._jobs.set(pid, { resolve: resolve as any, reject, ...options })
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

enum TriState {
  False = 0,
  Pending = 1,
  True = 2
}

function Player() {
  const [connected, set_connected] = useState<TriState>(TriState.False);
  const [registered, set_registered] = useState<TriState>(TriState.False);

  const [room_creating, set_room_creating] = useState<boolean>(false);
  const [room_joining, set_room_joining] = useState<boolean>(false);
  const [room, set_room] = useState<IRoomInfo | undefined>(void 0);
  const ref_room_id = useRef<string>('')

  const ref_ws = useRef<Connection | null>(null)
  function disconnect() {
    const ws = ref_ws.current
    if (!ws) return;
    ws.inner.close();
    set_connected(0);
    set_room(void 0);
    set_registered(0)
    ref_ws.current = null
  }
  function connect() {
    if (ref_ws.current) return;
    const ws = ref_ws.current = new Connection('ws://localhost:8080');
    set_connected(1);
    ws.inner.onopen = () => {
      console.log('已连接到服务器');
      set_connected(2);
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
    set_registered(1);
    ws.send<IReqRegister>({ type: MsgEnum.Register, name: 'player_1' }).then(() => {
      set_registered(2);
    }).catch(e => {
      console.error(e);
      set_registered(0)
    })
  }


  function create_room() {
    const ws = ref_ws.current
    if (!ws) return;
    set_room_creating(true)
    ws.send<IReqCreateRoom, IRespCreateRoom>({ type: MsgEnum.CreateRoom }).then((resp) => {
      set_room(resp.room)
    }).catch(e => {
      console.log(e)
    }).finally(() => {
      set_room_creating(false)
    })
  }
  function join_room() {
    const ws = ref_ws.current;
    if (!ws) return;
    set_room_joining(true)
    ws.send<IReqJoinRoom, IRespJoinRoom>({ type: MsgEnum.JoinRoom, roomid: ref_room_id.current }).then((resp) => {
      set_room(resp.room)
    }).catch(e => {
      console.log(e)
    }).finally(() => {
      set_room_joining(false)
    })
  }
  return (
    <Space>
      <Button size='s' disabled={connected === 1} onClick={connected ? disconnect : connect}>
        {connected === 1 ? 'connecting...' : connected === 2 ? 'disconnect' : 'connect'}
      </Button>
      <Show show={connected}>
        <Show show={registered !== 2}>
          <Button size='s' disabled={registered != 0} onClick={register}>
            {registered === 1 ? 'registering...' : 'register'}
          </Button>
        </Show>
        <Show show={room}>
          <Text>room id: {room?.id}</Text>
        </Show>
        <Show show={room_creating}>
          <Text>room creating...</Text>
        </Show>
        <Show show={room_joining}>
          <Text>room joining...</Text>
        </Show>

        <Show show={!room && registered && !room_joining && !room_creating}>
          <Button size='s' onClick={create_room}>create room</Button>
          <Combine>
            <Input
              prefix={<Text size='s'>room id:</Text>}
              placeholder="room id"
              defaultValue={ref_room_id.current}
              onChange={e => ref_room_id.current = e.target.value.trim()} />
            <Button size='s' onClick={join_room}>join room</Button>
          </Combine>
        </Show>
      </Show>
    </Space>
  )
}

export default function NetworkTest() {
  return (
    <Space vertical>
      <Player />
      <Player />
    </Space>
  )
}