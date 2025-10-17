import List from "rc-virtual-list";
import { ForwardedRef, forwardRef, useCallback, useEffect, useState } from "react";
import { Button } from "../../Component/Buttons/Button";
import { Divider } from "../../Component/Divider";
import { Flex } from "../../Component/Flex";
import Frame, { IFrameProps } from "../../Component/Frame";
import Show from "../../Component/Show";
import { Strong, Text } from "../../Component/Text";
import { useStateRef } from "../../hooks/useStateRef";
import { IRoomInfo, MsgEnum } from "../../Net";
import { Connection } from "./Connection";
import { TriState } from "./TriState";

export interface IRoomsBoxProps extends IFrameProps {
  conn?: Connection | null;
  conn_state?: TriState;
  room?: IRoomInfo | null;
  set_room?(room?: IRoomInfo | null): void;
}
function _RoomsBox(props: IRoomsBoxProps, ref: ForwardedRef<HTMLDivElement>) {
  const {
    style,
    conn = null,
    conn_state = TriState.False,
    room = null,
    set_room = () => void 0,
    ..._p
  } = props;

  const [loading, set_loading] = useState(false)
  const [rooms, set_rooms] = useState<IRoomInfo[]>([])
  const [room_creating, set_room_creating, ref_room_creating] = useStateRef<boolean>(false);
  const [room_joining, set_room_joining, ref_room_joining] = useStateRef<boolean>(false);

  const update_rooms = useCallback(() => {
    if (!conn) return;
    set_loading(true)
    conn.send(MsgEnum.ListRooms, {}).finally(() => set_loading(false))
  }, [conn])

  useEffect(() => {
    if (!conn || conn_state !== TriState.True) {
      set_loading(false)
      return;
    }
    update_rooms();
    const c = conn.callbacks.add({
      on_message: (resp) => {
        switch (resp.type) {
          case MsgEnum.JoinRoom:
          case MsgEnum.CreateRoom:
            set_room(resp.room);
            break;
          case MsgEnum.ListRooms:
            set_rooms(resp.rooms ?? []);
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
        }
      }
    });
    return () => c()
  }, [conn, conn_state === TriState.True])

  function create_room() {
    if (
      ref_room_joining.current ||
      ref_room_creating.current
    ) return;
    if (!conn) return;
    set_room_creating(true)
    conn.send(MsgEnum.CreateRoom, {
      min_players: 2,
      max_players: 4,
    }).then((resp) => {
      update_rooms()
    }).catch(e => {
      console.log(e)
    }).finally(() => {
      set_room_creating(false)
    })
  }

  function join_room(roomid: string) {
    if (
      !conn ||
      ref_room_joining.current ||
      ref_room_creating.current
    ) return;
    set_room_joining(true)
    conn.send(MsgEnum.JoinRoom, { roomid }).catch(e => {
      console.log(e)
    }).finally(() => {
      set_room_joining(false)
    })
  }
  return (
    <Frame style={{ padding: 0, ...style }} {..._p} ref={ref}>
      <Flex direction='column' align='stretch' gap={5} >
        <Flex gap={10} align='center' justify='space-between' >
          <Strong>{`房间列表`}</Strong>
          <Flex>
            <Show show={!room && conn_state && !room_joining && !room_creating}>
              <Button
                variants={['no_border', 'no_round', 'no_shadow']}
                onClick={() => create_room()}>
                新建房间
              </Button>
            </Show>
            <Button
              variants={['no_border', 'no_round', 'no_shadow']}
              onClick={() => update_rooms()} >
              刷新
            </Button>
          </Flex>
        </Flex>
      </Flex>
      <List data={rooms} itemKey={r => r.id!}>
        {(r) => <>
          <Divider />
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
                  onClick={() => join_room(r.id!)}>
                  加入
                </Button>
              </Flex>
            </Flex>
          </Flex>
        </>}
      </List>
    </Frame>
  )
}

export const RoomsBox = forwardRef<HTMLDivElement, IRoomsBoxProps>(_RoomsBox)