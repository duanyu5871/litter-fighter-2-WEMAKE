
import List from "rc-virtual-list";
import { ReactNode, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Button } from "../../Component/Buttons/Button";
import { Divider } from "../../Component/Divider";
import { Flex } from "../../Component/Flex";
import Frame from "../../Component/Frame";
import Show from "../../Component/Show";
import { Space } from "../../Component/Space";
import { Strong, Text } from "../../Component/Text";
import { useStateRef } from "../../hooks/useStateRef";
import { IRoomInfo, MsgEnum } from "../../Net";
import { Connection } from "./Connection";
import { Input } from "../../Component/Input";
import Combine from "../../Component/Combine";
import Select from "../../Component/Select";


indexedDB.databases().then((r) => console.log(r))

enum TriState {
  False = 0,
  Pending = '',
  True = 1
}

type TChatTarget = 'global' | 'room'
const chat_targets: [TChatTarget, ReactNode][] = [
  ['global', '全局'],
  ['room', '房间']
]
function Player() {
  const [chat_target, set_chat_target] = useStateRef<TChatTarget>('global');
  const [chat_msg_text, set_chat_msg_text] = useStateRef<string>('');
  const [chat_msg_sending, set_chat_msg_sending] = useStateRef<boolean>(false);
  const [connected, set_connected] = useState<TriState>(TriState.False);
  const [room_creating, set_room_creating, ref_room_creating] = useStateRef<boolean>(false);
  const [room_joining, set_room_joining, ref_room_joining] = useStateRef<boolean>(false);
  const [room, set_room, ref_room] = useStateRef<IRoomInfo | undefined>(void 0);
  const [rooms_loading, set_rooms_loading] = useState(false)
  const [rooms, set_rooms] = useState<IRoomInfo[]>([])
  const ref_room_id = useRef<string>('')
  const [conn, set_conn, ref_conn] = useStateRef<Connection | null>(null)
  const [countdown, set_countdown] = useState(5)
  const { players, me, owner, all_ready, is_owner } = useMemo(() => {
    const players = room?.players ?? []
    const me = players.find(v => v.id == conn?.player?.id) || null;
    const owner = players.find(v => v.id == room?.owner?.id) || null;
    const all_ready = !!(
      !players.some(v => !v.ready) &&
      room?.min_players &&
      players.length >= room.min_players
    )
    return { players, me, owner, all_ready, is_owner: me === owner } as const
  }, [room])

  useEffect(() => {
    let sec = 5
    set_countdown(sec);
    if (!all_ready) return;
    const tid = setInterval(() => {
      sec -= 1;
      set_countdown(sec);
      if (sec > 0) return;

      clearInterval(tid);
      if (is_owner)
        ref_conn.current?.send(MsgEnum.RoomStart, {})
    }, 1000)
    return () => clearInterval(tid)
  }, [all_ready, is_owner])

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
    set_conn(null);
  }
  function connect() {
    if (ref_conn.current) return;
    const conn = new Connection();
    set_conn(conn);

  }

  useEffect(() => {
    if (!conn) return;
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
    })
    conn.callbacks.add({
      on_message: (resp) => {
        switch (resp.type) {
          case MsgEnum.JoinRoom:
          case MsgEnum.CreateRoom:
            set_room(resp.room);
            break;
          case MsgEnum.ExitRoom:
          case MsgEnum.Kick:
            if (resp.player?.id === conn.player?.id) {
              set_room(void 0)
              update_rooms();
            } else {
              set_room(resp.room);
            }
            break;
          case MsgEnum.CloseRoom:
            set_room(void 0);
            update_rooms();
            break;
          case MsgEnum.PlayerReady:
            set_room(prev => {
              if (!prev) return prev;
              const { players } = prev;
              const ret = { ...prev }
              if (players?.length) {
                for (const p of players)
                  if (p.id === resp.player?.id)
                    p.ready = !!resp.ready;
                ret.players = [...players]
              }
              return ret
            })
            break;
          case MsgEnum.PlayerInfo:
            set_room(prev => {
              if (!prev) return prev;
              if (prev.players)
                for (const p of prev.players)
                  if (p.id === resp.player?.id)
                    Object.assign(p, resp.player)
              return { ...prev }
            })
            break;
          case MsgEnum.RoomStart:
          case MsgEnum.ListRooms:
        }
      }
    })
    return () => conn?.close()
  }, [conn])

  function create_room() {
    if (
      ref_room_joining.current ||
      ref_room_creating.current
    ) return;
    const conn = ref_conn.current
    if (!conn) return;
    set_room_creating(true)
    conn.send(MsgEnum.CreateRoom, {
      min_players: 2,
      max_players: 4,
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
        <Show show={me}>
          <Text>{me?.name}</Text>
        </Show>
        <Show show={room_creating}>
          <Text>room creating...</Text>
        </Show>
        <Show show={room_joining}>
          <Text>room joining...</Text>
        </Show>
        <Frame style={{ padding: 0 }}>
          <Flex direction='column' align='stretch' gap={5}>
            <Flex gap={10} align='center' justify='space-between' style={{ margin: 5 }}>
              <Strong>{`房间列表`}</Strong>
              <Button
                variants={['no_border', 'no_round', 'no_shadow']}
                onClick={() => update_rooms()} >
                刷新
              </Button>
            </Flex>
            <Divider />
          </Flex>
          <List data={rooms} itemKey={r => r.id!}>
            {(r) => (
              <Flex direction='column' align='stretch' gap={5}>
                <Flex gap={10} direction='column' align='stretch' justify='space-between' style={{ margin: 5 }}>
                  <Flex gap={10}>
                    <Strong> 房名: {r.title} </Strong>
                    <Text> 人数: {r.players?.length}/{r.max_players} </Text>
                  </Flex>
                  <Flex gap={10}>
                    <Text style={{ flex: 1 }}> 房主: {r.owner?.name} </Text>
                    <Button
                      variants={['no_border', 'no_round', 'no_shadow']}
                      onClick={() => join_room(r.id)}>
                      加入
                    </Button>
                  </Flex>
                </Flex>
                <Divider />
              </Flex>
            )}
          </List>
        </Frame>
        <Show show={room}>
          <Frame style={{ padding: 0 }}>
            <Flex direction='column' align='stretch' gap={5}>
              <Flex gap={10} align='center' justify='space-between' style={{ margin: 5 }}>
                <Strong>{`${room?.title} (${players?.length}/${room?.max_players})`}</Strong>
              </Flex>
              <Divider />
            </Flex>
            <List data={players} itemKey={r => r.id!}>
              {(other, index) => {
                const is_self = other.id === conn?.player?.id
                return (
                  <Flex direction='column' align='stretch' gap={5}>
                    <Flex gap={10} align='center' justify='space-between' style={{ margin: 5 }}>
                      <Text >
                        {other.name}
                      </Text>
                      <Text style={{ opacity: 0.5, verticalAlign: 'middle' }}>
                        {is_self ? '(你)' : ''}
                        {other.id == room?.owner?.id ? '👑' : ''}
                      </Text>
                      <Flex align='center'>
                        <Show show={owner?.id === me?.id && !is_self}>
                          <Button
                            size='s'
                            variants={['no_border', 'no_round', 'no_shadow']}
                            onClick={() => ref_conn.current?.send(MsgEnum.Kick, { playerid: other.id })}>
                            踢出
                          </Button>
                        </Show>
                        <Text> {other.ready ? '已准备' : '未准备'} </Text>
                      </Flex>
                    </Flex>
                    <Divider />
                  </Flex>
                )
              }}
            </List>
            {
              all_ready ?
                <Flex direction='row' align='stretch' justify='space-evenly' gap={5} style={{ margin: 5 }}>
                  即将开始，倒计时: {countdown}秒
                </Flex> : null
            }
            <Flex direction='row' align='stretch' justify='space-evenly' gap={5} style={{ margin: 5 }}>
              <Button
                variants={['no_border', 'no_round', 'no_shadow']}
                onClick={() => ref_conn.current?.send(MsgEnum.ExitRoom, {})}>
                <Text> 退出房间 </Text>
              </Button>
              <Button
                variants={['no_border', 'no_round', 'no_shadow']}
                onClick={() => ref_conn.current?.send(MsgEnum.PlayerReady, { ready: !me?.ready })}>
                {me?.ready ? '取消准备' : '准备!'}
              </Button>
            </Flex>
          </Frame>
        </Show>
        <Show show={!room && connected && !room_joining && !room_creating}>
          <Button size='s' onClick={create_room}>create room</Button>
        </Show>

        <Flex direction='column'>
          <Combine>
            <Select
              items={chat_targets}
              parse={i => i}
              value={chat_target}
              onChange={v => set_chat_target(v ?? 'global')} />
            <Input
              disabled={chat_msg_sending}
              maxLength={100}
              style={{ width: 100 }}
              placeholder="输入消息"
              value={chat_msg_text}
              onChange={set_chat_msg_text} />
            <Button disabled={chat_msg_sending || !chat_msg_text.trim()} onClick={() => {
              const conn = ref_conn.current;
              if (!conn) return;
              set_chat_msg_sending(true)
              conn.send(MsgEnum.Chat, {
                target: chat_target,
                text: chat_msg_text.trim()
              }).then(r => {
                set_chat_msg_text('');
              }).catch(e => {

              }).finally(() => {
                set_chat_msg_sending(false)
              })
            }}>
              发送
            </Button>
          </Combine>
        </Flex>
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