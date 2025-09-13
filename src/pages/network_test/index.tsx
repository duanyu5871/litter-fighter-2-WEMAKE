
import List from "rc-virtual-list";
import { useCallback, useEffect, useRef, useState } from "react";
import { Button } from "../../Component/Buttons/Button";
import Combine from "../../Component/Combine";
import Frame from "../../Component/Frame";
import { Input } from "../../Component/Input";
import Select from "../../Component/Select";
import Show from "../../Component/Show";
import { Space } from "../../Component/Space";
import { Strong, Text } from "../../Component/Text";
import { IReqCreateRoom, IReqJoinRoom, IReqListRooms, IRespCreateRoom, IRespJoinRoom, IRespListRooms, IRoomInfo, MsgEnum } from "../../net_msg_definition";
import { Connection } from "./Connection";


indexedDB.databases().then((r) => console.log(r))

enum TriState {
  False = 0,
  Pending = 1,
  True = 2
}

function Player() {
  const [connected, set_connected] = useState<TriState>(TriState.False);

  const [room_creating, set_room_creating] = useState<boolean>(false);
  const [room_joining, set_room_joining] = useState<boolean>(false);
  const [room, set_room] = useState<IRoomInfo | undefined>(void 0);
  const [rooms_loading, set_rooms_loading] = useState(false)
  const [rooms, set_rooms] = useState<IRoomInfo[]>([])
  const ref_room_id = useRef<string>('')

  const ref_conn = useRef<Connection | null>(null)

  const update_rooms = useCallback(() => {
    const conn = ref_conn.current;
    if (!conn) return;
    set_rooms_loading(true)
    conn.send<IReqListRooms, IRespListRooms>({
      type: MsgEnum.ListRooms
    }).then((r) => {
      set_rooms(r.rooms ?? [])
    }).finally(() => {
      set_rooms_loading(false)
    })
  }, [])

  function disconnect() {
    const conn = ref_conn.current
    if (!conn) return;
    conn.close();
    set_connected(0);
    set_room(void 0);
    ref_conn.current = null
  }
  function connect() {
    if (ref_conn.current) return;
    const conn = ref_conn.current = new Connection();
    conn.open('ws://localhost:8080')
    set_connected(1);
    conn.callbacks.once('on_open', () => {
      console.log('on_open');
    })
    conn.callbacks.once('on_close', () => {
      console.log('on_close');
    })
    conn.callbacks.once('on_error', (err) => {
      console.error('on_error:', err);
    })
    conn.callbacks.once('on_register', (resp) => {
      console.log('on_register:', resp);
      set_connected(2);
      update_rooms()
    })
  }

  function create_room() {
    const conn = ref_conn.current
    if (!conn) return;
    set_room_creating(true)
    conn.send<IReqCreateRoom, IRespCreateRoom>({
      type: MsgEnum.CreateRoom,
      max_users: 8,
      title: 'Hello World',
    }).then((resp) => {
      set_room(resp.room)
      update_rooms()
    }).catch(e => {
      console.log(e)
    }).finally(() => {
      set_room_creating(false)
    })
  }
  function join_room() {
    const conn = ref_conn.current;
    if (!conn) return;
    set_room_joining(true)
    conn.send<IReqJoinRoom, IRespJoinRoom>({ type: MsgEnum.JoinRoom, roomid: ref_room_id.current }).then((resp) => {
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
        <Show show={room}>
          <Text>room: {room?.id}</Text>
        </Show>
        <Show show={room_creating}>
          <Text>room creating...</Text>
        </Show>
        <Show show={room_joining}>
          <Text>room joining...</Text>
        </Show>
        <Frame label='room list'>
          <List data={rooms} itemKey={r => r.id!}>
            {(room) => {
              return (
                <Space>
                  <Strong>
                    {room.title || room.id}
                  </Strong>
                  <Strong>
                    {room.master?.name}
                  </Strong>
                  <Strong>
                    人数:
                    {room.users?.length}
                    {room.max_users ? '/' + room.max_users : null}
                  </Strong>
                </Space>
              )
            }}
          </List>
        </Frame>

        <Show show={!room && connected && !room_joining && !room_creating}>
          <Button size='s' onClick={create_room}>create room</Button>
          <Combine>
            <Input
              prefix={<Text size='s'>room id:</Text>}
              placeholder="room id"
              defaultValue={ref_room_id.current}
              onChange={e => ref_room_id.current = e.trim()} />
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
      {/* 
      <div style={{
        background: 'green',
        borderRadius: 5,
      }}>
        <input type="text" style={{
          background: 'transparent',
          outline: 'none',
          color: 'white',
          border: 'none',
          padding: 9,
          minWidth: 0,
          width: 'auto'
        }} defaultValue='hello world' />
      </div> 
      */}
    </Space>
  )
}