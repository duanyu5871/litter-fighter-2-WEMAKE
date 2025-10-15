
import List from "rc-virtual-list";
import { useCallback, useRef, useState } from "react";
import { Button } from "../../Component/Buttons/Button";
import Frame from "../../Component/Frame";
import Show from "../../Component/Show";
import { Space } from "../../Component/Space";
import { Strong, Text } from "../../Component/Text";
import { IPlayerInfo, IRoomInfo, MsgEnum } from "../../Net";
import { Connection } from "./Connection";
import { useStateRef } from "../../hooks/useStateRef";
import { Flex } from "../../Component/Flex";
import { Divider } from "../../Component/Divider";


indexedDB.databases().then((r) => console.log(r))

enum TriState {
  False = 0,
  Pending = '',
  True = 1
}

function Player() {
  const [connected, set_connected] = useState<TriState>(TriState.False);
  const [room_creating, set_room_creating, ref_room_creating] = useStateRef<boolean>(false);
  const [room_joining, set_room_joining, ref_room_joining] = useStateRef<boolean>(false);
  const [player, set_player, ref_player] = useStateRef<IPlayerInfo | undefined>(void 0)
  const [room, set_room, ref_room] = useStateRef<IRoomInfo | undefined>(void 0);
  const [rooms_loading, set_rooms_loading] = useState(false)
  const [rooms, set_rooms] = useState<IRoomInfo[]>([])
  const ref_room_id = useRef<string>('')

  const [conn, set_conn, ref_conn] = useStateRef<Connection | null>(null)

  const update_rooms = useCallback(() => {
    const conn = ref_conn.current;
    if (!conn) return;
    set_rooms_loading(true)
    conn.send(MsgEnum.ListRooms, {}).then((r) => {
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
    set_player(void 0)
    set_conn(null);
  }
  function connect() {
    if (ref_conn.current) return;
    const conn = new Connection();
    set_conn(conn);
    conn.open('ws://localhost:8080')
    set_connected(TriState.Pending);
    conn.callbacks.once('on_close', (e) => {
      set_connected(TriState.False)
      set_room(void 0)
    })
    conn.callbacks.once('on_register', (resp) => {
      console.log('on_register:', resp);
      set_connected(TriState.True);
      update_rooms()
      set_player(resp.player)
    })
    conn.callbacks.add({
      on_message: (resp) => {
        switch (resp.type) {
          case MsgEnum.JoinRoom:
          case MsgEnum.CreateRoom:
            set_room(resp.room);
            break;
          case MsgEnum.ExitRoom:
            if (resp.player?.id === conn.player?.id)
              set_room(void 0)
            else
              set_room(resp.room);
            break;
          case MsgEnum.CloseRoom:
            set_room(void 0);
            break;

          case MsgEnum.PlayerInfo:
          case MsgEnum.PlayerReady:
          case MsgEnum.RoomStart:
          case MsgEnum.ListRooms:
        }
      }
    })

  }

  function create_room() {
    if (
      ref_room_joining.current ||
      ref_room_creating.current
    ) return;
    const conn = ref_conn.current
    if (!conn) return;
    set_room_creating(true)
    conn.send(MsgEnum.CreateRoom, {
      max_players: 8,
    }).then((resp) => {
      set_room(resp.room)
      update_rooms()
    }).catch(e => {
      console.log(e)
    }).finally(() => {
      set_room_creating(false)
    })
  }
  function join_room(roomid = ref_room_id.current) {
    if (
      ref_room_joining.current ||
      ref_room_creating.current
    ) return;
    const conn = ref_conn.current;
    if (!conn) return;
    set_room_joining(true)
    conn.send(MsgEnum.JoinRoom, { roomid }).then((resp) => {
      set_room(resp.room)
    }).catch(e => {
      console.log(e)
    }).finally(() => {
      set_room_joining(false)
    })
  }
  return (
    <Space>
      <Button size='s' disabled={connected === TriState.Pending} onClick={connected ? disconnect : connect}>
        {connected === TriState.Pending ? 'connecting...' : connected === TriState.False ? 'connect' : 'disconnect'}
      </Button>
      <Show show={connected === TriState.True}>
        <Show show={player}>
          <Text>{player?.name}</Text>
        </Show>
        <Show show={room_creating}>
          <Text>room creating...</Text>
        </Show>
        <Show show={room_joining}>
          <Text>room joining...</Text>
        </Show>
        <Show show={!room}>
          <Frame label='room list'>
            <Button onClick={() => update_rooms()}>
              refresh
            </Button>
            <List data={rooms} itemKey={r => r.id!}>
              {(r) => (
                <Flex direction='column' align='stretch' gap={5} style={{ marginTop: 5 }}>
                  <Flex gap={10}>
                    <Strong> 房名: {r.title} </Strong>
                    <Button onClick={() => join_room(r.id)}>
                      Join
                    </Button>
                  </Flex>
                  <Flex gap={10}>
                    <Text style={{ flex: 1 }}> 房主: {r.owner?.name} </Text>
                    <Text> 人数: {r.players?.length}/{r.max_players} </Text>
                  </Flex>
                  <Divider />
                </Flex>
              )}
            </List>
          </Frame>
        </Show>
        <Show show={room}>
          <Frame label={`${room?.title} players`}>
            <List data={room?.players || []} itemKey={r => r.id!}>
              {(other) => {
                const is_self = other.id === player?.id
                return (
                  <Flex direction='column' align='stretch' gap={5} style={{ marginTop: 5 }}>
                    <Flex gap={10} align='center' justify='space-between'>
                      <Text >
                        {other.name}
                      </Text>
                      <Text style={{ opacity: 0.8, verticalAlign: 'middle' }}>
                        {is_self ? '(你)' : ''}
                        {other.id == room?.owner?.id ? '👑' : ''}
                      </Text>
                      {
                        is_self ?
                          <Text> {other.ready ? '已准备' : '未准备'} </Text> :
                          <Text> {other.ready ? '已准备' : '未准备'} </Text>
                      }
                    </Flex>
                    <Divider />
                  </Flex>
                )
              }}
            </List>
          </Frame>
        </Show>
        <Show show={!room && connected && !room_joining && !room_creating}>
          <Button size='s' onClick={create_room}>create room</Button>
        </Show>
      </Show>
    </Space>
  )
}

export default function NetworkTest() {
  return (
    <Space vertical>
      <Player />
    </Space>
  )
}