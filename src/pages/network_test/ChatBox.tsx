
import List, { ListRef } from "rc-virtual-list";
import { ForwardedRef, forwardRef, ReactNode, useEffect, useMemo, useRef } from "react";
import { Button } from "../../Component/Buttons/Button";
import Combine from "../../Component/Combine";
import { Flex, IFlexProps } from "../../Component/Flex";
import { Input, InputRef } from "../../Component/Input";
import { useShortcut } from "../../Component/useShortcut";
import { useStateRef } from "../../hooks/useStateRef";
import { IRespChat, IRoomInfo, MsgEnum } from "../../Net";
import { Connection } from "./Connection";
import styles from "./styles.module.scss";
export const enum ChatTarget {
  Global = 'global',
  Room = 'room',
  Private = 'private',
}
export const chat_target_labels = {
  [ChatTarget.Global]: "全局",
  [ChatTarget.Room]: "房间",
  [ChatTarget.Private]: "私聊"
} as const
export const all_chat_targets: [ChatTarget, ReactNode][] = [
  [ChatTarget.Global, '全局'],
  [ChatTarget.Room, '房间']
]
export interface IChatBoxProps extends IFlexProps {
  conn?: Connection | null;
  room?: IRoomInfo | undefined
}
const msg_item_height = parseInt(styles.msg_item_height);
const msg_list_height = 240;
function _ChatBox(props: IChatBoxProps, ref: ForwardedRef<HTMLDivElement>) {
  const { conn = null, room = null, ..._p } = props;

  const chat_targets = useMemo(() => {
    if (room) return all_chat_targets;
    return all_chat_targets.filter(v => v[0] !== 'room')
  }, [!room])
  const ref_input = useRef<InputRef>(null);
  const [chat_target, set_chat_target, ref_chat_target] = useStateRef(ChatTarget.Global);
  const [chat_msg_text, set_chat_msg_text] = useStateRef<string>('');
  const [chat_msg_sending, set_chat_msg_sending] = useStateRef<boolean>(false);
  const [msgs, set_msgs, ref_msgs] = useStateRef<IRespChat[]>([]);
  const [is_bottom, set_is_bottom] = useStateRef(true)
  const ref_list = useRef<ListRef>(null)

  useEffect(() => {
    if (!room && chat_target === ChatTarget.Room)
      set_chat_target(ChatTarget.Global)
  }, [!room, chat_target]);

  useEffect(() => {
    if (!conn) return;
    const cancel = conn.callbacks.add({
      on_message: (resp) => {
        switch (resp.type) {
          case MsgEnum.Chat:
            const list = ref_list.current;
            if (!list) break;
            const { y } = ref_list.current!.getScrollInfo()
            const dist_to_bottom = msg_item_height * msgs.length - y - msg_list_height
            set_is_bottom(dist_to_bottom < 20)
            set_msgs(v => [...v.slice(-100), resp]);
            break;
        }
      }
    })
    return () => cancel()
  }, [conn])

  const send = () => {
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
  }

  const switch_chat_target = () => {
    const idx = chat_targets.findIndex(i => i[0] === ref_chat_target.current)
    const [next] = chat_targets[(idx + 1) % chat_targets.length]
    set_chat_target(next);
    ref_input.current?.input?.focus();
  }
  useShortcut('alt+y', !1, switch_chat_target, window)

  useShortcut('alt+t', !1, () => {
    ref_input.current?.input?.focus();
  }, window)

  useEffect(() => {
    if (!is_bottom) return;
    const list = ref_list.current;
    if (!list) return;
    list.scrollTo(Number.MAX_SAFE_INTEGER)
  }, [is_bottom, msgs])

  let input_prefix_classname = styles.msg_item;
  switch (chat_target!) {
    case "global": input_prefix_classname = styles.color_global; break;
    case "room": input_prefix_classname = styles.color_room; break;
  }
  return (
    <Flex direction='column' {..._p} ref={ref}>
      <List
        virtual
        style={{
          background: 'rgba(0, 0, 0, 0.5)',
        }}
        data={msgs}
        ref={ref_list}
        height={Math.min(msg_list_height, msg_item_height * msgs.length)}
        itemHeight={msg_item_height}
        itemKey={i => '' + i.seq}>
        {i => {
          let classname = styles.msg_item
          switch (i.target!) {
            case "global": classname = styles.msg_item_global; break;
            case "room": classname = styles.msg_item_room; break;
            case "private": classname = styles.msg_item_pri; break;
          }
          let name = i.sender?.name;
          if (i.sender?.id === conn?.player?.id)
            name = `[你]${name}`
          return (
            <div className={classname}>
              {`${name}: ${i.text}`}
            </div>
          )
        }}
      </List>
      <Combine style={{ alignSelf: 'start' }}>
        <Input
          ref={ref_input}
          disabled={chat_msg_sending}
          maxLength={100}
          data-flex={1}
          prefix={
            <Button
              variants={['no_border', 'no_round', 'no_shadow']}
              onClick={() => switch_chat_target()}
              size='s'>
              <span className={input_prefix_classname}>
                [{chat_target_labels[chat_target]}]
              </span>
            </Button>
          }
          style={{ minWidth: 350, maxWidth: 350 }}
          placeholder="输入消息"
          onKeyUp={e => {
            if ('enter' === e.key?.toLowerCase())
              send();
          }}
          value={chat_msg_text}
          onChange={set_chat_msg_text} />
        <Button
          disabled={chat_msg_sending || !chat_msg_text.trim()}
          onClick={() => send()}>
          发送
        </Button>
      </Combine>
    </Flex>
  )
}

export const ChatBox = forwardRef<HTMLDivElement, IChatBoxProps>(_ChatBox)