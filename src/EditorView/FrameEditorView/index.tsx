import classNames from "classnames";
import React, { useContext, useEffect, useMemo, useRef, useState } from "react";
import { Button } from "../../Component/Buttons/Button";
import Combine from "../../Component/Combine";
import Frame from "../../Component/Frame";
import { Input } from "../../Component/Input";
import Select from "../../Component/Select";
import Show from "../../Component/Show";
import { TabButtons } from "../../Component/TabButtons";
import Titled from "../../Component/Titled";
import { Defines, IFrameInfo, INextFrame } from "../../LF2/defines";
import { IEntityData } from "../../LF2/defines/IEntityData";
import { map_arr } from "../../LF2/utils/array/map_arr";
import { shared_ctx } from "../Context";
import { STATE_SELECT_PROPS } from "../EntityEditorView";
import styles from "./styles.module.scss";
import { useEditor } from "./useEditor";
import { Space } from "../../Component/Space";

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
export interface IFrameEditorViewProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'onChange'> {
  value: IFrameInfo;
  data: IEntityData;
  on_click_frame?(frame: IFrameInfo, data: IEntityData): void;
  on_frame_change?(frame: IFrameInfo, data: IEntityData): void;
  on_click_goto_next_frame?(next_frame: INextFrame, data: IEntityData): void;
  on_click_play?(frame: IFrameInfo, data: IEntityData): void;
  selected?: boolean;
}
export function FrameEditorView(props: IFrameEditorViewProps) {
  const { zip } = useContext(shared_ctx);
  const {
    value, data, on_click_frame, on_frame_change, on_click_goto_next_frame,
    selected, on_click_play, ..._p
  } = props;


  const ref_canvas = useRef<HTMLCanvasElement>(null);
  const ref_on_click_frame = useRef(on_click_frame);
  ref_on_click_frame.current = on_click_frame;
  const ref_on_frame_change = useRef(on_frame_change);
  ref_on_frame_change.current = on_frame_change;

  const ref_on_click_goto_next_frame = useRef(on_click_goto_next_frame);
  ref_on_click_goto_next_frame.current = on_click_goto_next_frame;

  const ref_on_click_play = useRef(on_click_play);
  ref_on_click_play.current = on_click_play;

  const [editing, set_editing] = useState<TabEnum | undefined>(TabEnum.Base);

  const { pic, bdy, itr, centerx, centery } = value;
  const { base: { files } } = data;
  useEffect(() => {
    if (!pic || !zip || !files) { return }
    const canvas = ref_canvas.current
    const ctx = ref_canvas.current?.getContext('2d');
    if (!canvas || !ctx) return;
    let p = canvas.parentElement;
    while (p) {
      if ('auto' === getComputedStyle(p).overflowY) {
        const pp = p;
        const is_appear = () => {
          const rect = canvas.getBoundingClientRect()
          return (rect.top >= 0 && rect.top <= window.innerHeight) ||
            (rect.bottom >= 0 && rect.bottom <= window.innerHeight)
        }
        const render = () => {
          if (!is_appear()) return;
          // drawer?.draw(ctx, zip, data, frame)
          pp.removeEventListener('scroll', render)
        }
        if (is_appear()) {
          render()
        } else {
          pp.addEventListener('scroll', render)
          return () => pp.removeEventListener('scroll', render)
        }
      }
      p = p.parentElement;
    }

  }, [pic, files, zip, centerx, centery, bdy, itr, data, value]);

  const { frames } = data;
  const next_frame_selects = useMemo(() => {
    const frame_list: IFrameInfo[] = [{
      id: Defines.FrameId.Auto,
      name: "Auto",
      state: 0,
      wait: 0,
      next: {},
      centerx: 0,
      centery: 0
    }, {
      id: Defines.FrameId.Gone,
      name: "Gone",
      state: 0,
      wait: 0,
      next: {},
      centerx: 0,
      centery: 0
    }, {
      id: Defines.FrameId.Self,
      name: "Self",
      state: 0,
      wait: 0,
      next: {},
      centerx: 0,
      centery: 0
    }]
    for (const key in frames) {
      frame_list.push(frames[key])
    }
    const ret: React.ReactNode[] = map_arr(value.next, (n, idx) => {
      return (
        <Combine key={idx}>
          <Select
            key={idx}
            title="下一帧"
            value={n.id}
            items={frame_list}
            parse={i => [i.id, i.name + '(' + i.id + ')']}
            style={{ width: 150, boxSizing: 'border-box' }}
          />
          <Button onClick={() => ref_on_click_goto_next_frame.current?.(n, data)}>
            Go
          </Button>
        </Combine>
      )
    });
    return ret
  }, [value, frames, data])

  const Editor = useEditor(value)
  return (
    <Frame
      id={`${data.id}###${value.id}`}
      className={classNames(styles.frame_editor_view, { selected })}
      tabIndex={-1}
      {..._p}
      onClick={(e) => {
        const ele = e.target as HTMLElement;
        if (ele.tagName === 'DIV')
          ref_on_click_frame.current?.(value, data)
      }}
      style={{
        overflow: 'hidden',
        flexShrink: 0,
        display: 'flex',
        flexDirection: 'column',
        gap: 5
      }}>
      <Space direction='column'>
        <Editor.EditorStr field='id' />
        <Editor.EditorStr field='name' />
        <TabButtons
          style={{ alignSelf: 'center' }}
          value={editing}
          items={Object.values(TabEnum)}
          parse={v => [v, tab_labels[v]]}
          onChange={v => set_editing(prev => v === prev ? void 0 : v)} />
        <Show show={editing === 'base'}>
          <Space direction="column">
            <Editor.EditorSel {...STATE_SELECT_PROPS} field="state" />
            <Titled float_label='图片' style={{ width: '100%' }}>
              <Combine direction='column' style={{ flex: 1 }}>
                <Input defaultValue={value.pic?.tex} prefix="tex" style={{ alignSelf: 'stretch' }} />
                <Combine style={{ alignSelf: 'stretch' }}>
                  <Input defaultValue={value.pic?.x} prefix="x" style={{ flex: 1 }} />
                  <Input defaultValue={value.pic?.y} prefix="y" style={{ flex: 1 }} />
                  <Input defaultValue={value.pic?.w} prefix="w" style={{ flex: 1 }} />
                  <Input defaultValue={value.pic?.h} prefix="h" style={{ flex: 1 }} />
                </Combine>
              </Combine>
            </Titled>
            <Editor.EditorVec2
              name="锚点"
              fields={['centerx', 'centery']}
              style={{ width: '100%' }} />
            <Editor.EditorInt field="wait" clearable={false} title="当前动作持续多少帧数" />
            {/* <Titled label='持续帧数'>
          <Combine>
            <Combine direction='column'>
              {next_frame_selects}
            </Combine>
          </Combine>
        </Titled> */}
            {/* <Titled label='　　声音'>
          <Combine >
            <Input {...edit_string('sound')} />
            {value.sound ? <AudioButton zip={zip} path={value.sound} /> : null}
          </Combine>
        </Titled> */}
          </Space>
        </Show>
        <Show show={editing === TabEnum.Spd}>
          <Space direction="column">
            <Editor.EditorVec3 name="速度" fields={['dvx', 'dvy', 'dvz']} />
            <Editor.EditorVec3 name="加速度" fields={['acc_x', 'acc_y', 'acc_z']} />
            {/* <Titled label='　　速度模式'>
          <Combine>
            <Select {...SPEED_MODE_SELECT_PROPS} {...edit_num_select('vxm')} style={{ width: 80, boxSizing: 'border-box' }} />
            <Select {...SPEED_MODE_SELECT_PROPS} {...edit_num_select('vym')} style={{ width: 80, boxSizing: 'border-box' }} />
            <Select {...SPEED_MODE_SELECT_PROPS} {...edit_num_select('vzm')} style={{ width: 80, boxSizing: 'border-box' }} />
          </Combine>
        </Titled> */}
            <Editor.EditorVec3 name="操作速度" fields={['ctrl_spd_x', 'ctrl_spd_y', 'ctrl_spd_z']} />
            <Editor.EditorVec3 name="操作加速度" fields={['ctrl_acc_x', 'ctrl_acc_y', 'ctrl_acc_z']} />
            {/* <Titled label='操作速度模式'>
          <Combine>
            <Select {...SPEED_MODE_SELECT_PROPS} {...edit_num_select('ctrl_spd_x_m')} style={{ width: 80, boxSizing: 'border-box' }} />
            <Select {...SPEED_MODE_SELECT_PROPS} {...edit_num_select('ctrl_spd_y_m')} style={{ width: 80, boxSizing: 'border-box' }} />
            <Select {...SPEED_MODE_SELECT_PROPS} {...edit_num_select('ctrl_spd_z_m')} style={{ width: 80, boxSizing: 'border-box' }} />
          </Combine>
        </Titled> */}
          </Space>
        </Show>

      </Space>
      {/* <Show show={editing === 'itr'}>
        <Button style={{ alignSelf: 'stretch' }} onClick={() => {
          set_frame(prev => {
            const next: IFrameInfo = { ...prev };
            const itr: IItrInfo = { z: 0, l: 0, x: 0, y: 0, w: 0, h: 0 }
            if (next.itr) next.itr = [itr, ...next.itr]
            else next.itr = [itr]
            return next;
          })
        }}>
          add itr
        </Button>
        {
          value.itr && map_arr(value.itr, (itr, idx) => {
            const name = `itr[${idx}]`;
            const on_change = (itr: IItrInfo) => set_frame(prev => {
              const next: IFrameInfo = { ...prev }
              if (next.itr) {
                next.itr[idx] = itr
                next.itr = [...next.itr]
              }
              return next
            })
            const on_remove = () => set_frame(prev => {
              const next: IFrameInfo = { ...prev };
              next.itr?.splice(idx, 1)
              if (next.itr?.length) next.itr = [...next.itr]
              if (!next.itr?.length) delete next.itr;
              return next;
            })
            return (
              <ItrEditorView
                key={name}
                label={name}
                value={itr}
                onChange={on_change}
                onRemove={on_remove} />
            )
          })
        }
      </Show>
      <Show show={editing === 'bdy'}>
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

