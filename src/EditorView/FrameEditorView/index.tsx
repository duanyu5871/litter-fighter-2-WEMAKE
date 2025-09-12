import { useRef, useState } from "react";
import Combine from "../../Component/Combine";
import Frame, { IFrameProps } from "../../Component/Frame";
import { Input } from "../../Component/Input";
import Show from "../../Component/Show";
import { Space } from "../../Component/Space";
import { TabButtons } from "../../Component/TabButtons";
import Titled from "../../Component/Titled";
import { IFrameInfo } from "../../LF2/defines";
import { IEntityData } from "../../LF2/defines/IEntityData";
import { map_arr } from "../../LF2/utils/array/map_arr";
import { SPEED_MODE_SELECT_PROPS, STATE_SELECT_PROPS } from "../EntityEditorView";
import { ItrEditorView } from "./ItrEditorView";
import { useEditor } from "./useEditor";
import { useThrough } from "./useThrough";

enum TabEnum {
  Base = 'base',
  Spd = 'spd',
  Itr = 'itr',
  Bdy = 'bdy',
  Cpoint = 'cpoint',
  Opoint = 'opoint',
  Bpoint = 'bpoint'
}
const tab_labels: Record<TabEnum, string> = {
  [TabEnum.Base]: "基础",
  [TabEnum.Spd]: "速度",
  [TabEnum.Itr]: "攻击",
  [TabEnum.Bdy]: "身体",
  [TabEnum.Cpoint]: "持械",
  [TabEnum.Opoint]: "发射",
  [TabEnum.Bpoint]: "吐血"
}
export const img_map = (window as any).img_map = new Map<string, HTMLImageElement>();
export interface IFrameEditorViewProps extends Omit<IFrameProps, 'onChange'> {
  value: IFrameInfo;
  data: IEntityData;
  selected?: boolean;
}
const TAG = 'FrameEditorView'
export function FrameEditorView(props: IFrameEditorViewProps) {
  const { value, data, onBlur, onFocus, ..._p } = props;
  const [editing, set_editing] = useState<TabEnum | undefined>(TabEnum.Base);
  const Editor = useEditor<IFrameInfo>(value)
  const ref_root = useRef<HTMLDivElement>(null)
  const label = `frame:${value.id}`
  const on_blur = useThrough(onBlur, () => {
    console.log(`[${TAG}>>on_blur] called.`)
  })
  const on_focus = useThrough(onFocus, () => {
    console.log(`[${TAG}>>on_focus] called.`)
  })
  return (
    <Frame label={label} {..._p} ref={ref_root} tabIndex={-1} onBlur={on_blur} onFocus={on_focus}>
      <Space direction='column' stretchs>
        <Editor.String field='id' />
        <Editor.String field='name' />
        <Space.Item style={{ display: 'flex' }}>
          <TabButtons
            style={{ flex: 1 }}
            value={editing}
            items={Object.values(TabEnum)}
            parse={v => [v, tab_labels[v]]}
            onChange={v => set_editing(prev => v === prev ? void 0 : v)}
            styles={{ button: { flex: 1 } }} />
        </Space.Item>
        <Show show={editing === 'base'}>
          <Space direction="column" stretchs>
            <Editor.Select {...STATE_SELECT_PROPS} field="state" />
            <Titled float_label='图片' style={{ width: '100%' }}>
              <Combine direction='column' style={{ flex: 1 }}>
                <Input defaultValue={value.pic?.tex} prefix="tex" style={{ flex: 1 }} data-flex={1} />
                <Combine style={{ flex: 1 }} data-flex={1}>
                  <Input defaultValue={value.pic?.x} prefix="x" style={{ flex: 1 }} data-flex={1} />
                  <Input defaultValue={value.pic?.y} prefix="y" style={{ flex: 1 }} data-flex={1} />
                  <Input defaultValue={value.pic?.w} prefix="w" style={{ flex: 1 }} data-flex={1} />
                  <Input defaultValue={value.pic?.h} prefix="h" style={{ flex: 1 }} data-flex={1} />
                </Combine>
              </Combine>
            </Titled>
            <Editor.EditorVec2 name="锚点" fields={['centerx', 'centery']} />
            <Editor.Number defaultValue={value.wait} field="wait" clearable={false} title="当前动作持续多少帧数" />
          </Space>
        </Show>
        <Show show={editing === TabEnum.Spd}>
          <Space direction="column" stretchs>
            <Editor.Number3 name="速度" fields={['dvx', 'dvy', 'dvz']} />
            <Editor.Number3 name="加速度" fields={['acc_x', 'acc_y', 'acc_z']} />
            <Editor.Sel3
              name="速度模式"
              fields={['vxm', 'vym', 'vzm']}
              placeholders={['x', 'y', 'z']}
              select={SPEED_MODE_SELECT_PROPS} />
          </Space>
        </Show>
      </Space>
      <Show show={editing === 'itr'}>
        {/* <Button style={{ alignSelf: 'stretch' }} onClick={() => {
          set_frame(prev => {
            const next: IFrameInfo = { ...prev };
            const itr: IItrInfo = { z: 0, l: 0, x: 0, y: 0, w: 0, h: 0 }
            if (next.itr) next.itr = [itr, ...next.itr]
            else next.itr = [itr]
            return next;
          })
        }}>
          add itr
        </Button> */}
        {
          map_arr(value.itr ?? [], (itr, idx) => {
            const name = `itr[${idx}]`;
            // const on_change = (itr: IItrInfo) => set_frame(prev => {
            //   const next: IFrameInfo = { ...prev }
            //   if (next.itr) {
            //     next.itr[idx] = itr
            //     next.itr = [...next.itr]
            //   }
            //   return next
            // })
            // const on_remove = () => set_frame(prev => {
            //   const next: IFrameInfo = { ...prev };
            //   next.itr?.splice(idx, 1)
            //   if (next.itr?.length) next.itr = [...next.itr]
            //   if (!next.itr?.length) delete next.itr;
            //   return next;
            // })
            return (
              <ItrEditorView
                key={name}
                label={name}
                value={itr}
              // onChange={on_change}
              // onRemove={on_remove} 
              />
            )
          })
        }
      </Show>
      {/* <Show show={editing === 'bdy'}>
        <Button style={{ alignSelf: 'stretch' }} onClick={() => {
          set_frame(prev => {
            const next: IFrameInfo = { ...prev };
            const bdy: IBdyInfo = {
              z: 0, l: 0, x: 0, y: 0, w: 0, h: 0,
              kind: BdyKind.Normal,
            }
            if (next.bdy) next.bdy = [bdy, ...next.bdy]
            else next.bdy = [bdy]
            return next;
          })
        }}>
          add bdy
        </Button>
        {
          value.bdy && map_arr(value.bdy, (bdy, idx) => {
            const name = `bdy[${idx}]`;
            const on_change = (bdy: IBdyInfo) => set_frame(prev => {
              const next: IFrameInfo = { ...prev }
              if (next.bdy) {
                next.bdy[idx] = bdy
                next.bdy = [...next.bdy]
              }
              return next
            })
            const on_remove = () => set_frame(prev => {
              const next: IFrameInfo = { ...prev };
              next.bdy?.splice(idx, 1)
              if (next.bdy?.length) next.bdy = [...next.bdy]
              if (!next.bdy?.length) delete next.bdy;
              return next;
            })
            return (
              <BdyEditorView
                key={name}
                label={name}
                value={bdy}
                onChange={on_change}
                onRemove={on_remove} />
            )
          })
        }
      </Show> */}
    </Frame>
  );
}

