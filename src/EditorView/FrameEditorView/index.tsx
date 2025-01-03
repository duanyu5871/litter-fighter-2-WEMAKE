import classNames from "classnames";
import React, { useContext, useEffect, useMemo, useRef, useState } from "react";
import { Button } from "../../Component/Buttons/Button";
import Combine from "../../Component/Combine";
import Frame from "../../Component/Frame";
import { Input, InputProps } from "../../Component/Input";
import Select from "../../Component/Select";
import Show from "../../Component/Show";
import { Space } from "../../Component/Space";
import { TabButtons } from "../../Component/TabButtons";
import Titled from "../../Component/Titled";
import { Defines, IBdyInfo, IFrameInfo, IItrInfo, INextFrame } from "../../LF2/defines";
import { BdyKind } from "../../LF2/defines/BdyKind";
import { IEntityData } from "../../LF2/defines/IEntityData";
import { map_arr } from "../../LF2/utils/array/map_arr";
import { shared_ctx } from "../Context";
import { ITR_KIND_SELECT_PROPS, SPEED_MODE_SELECT_PROPS, STATE_SELECT_PROPS } from "../EntityEditorView";
import { ItrEditorView } from "./ItrEditorView";
import styles from "./styles.module.scss";
import { is_num, num_or } from "../../LF2/utils/type_check";

enum TabEnum {
  Base = 'base',
  Itr = 'itr',
  Bdy = 'bdy',
  Cpoint = 'cpoint',
  Opoint = 'opoint',
  Bpoint = 'bpoint'
}
const tab_labels: Record<TabEnum, string> = {
  [TabEnum.Base]: "基础",
  [TabEnum.Itr]: "攻击",
  [TabEnum.Bdy]: "身体",
  [TabEnum.Cpoint]: "持械",
  [TabEnum.Opoint]: "发射",
  [TabEnum.Bpoint]: "吐血"
}



export const img_map = (window as any).img_map = new Map<string, HTMLImageElement>();
export interface IFrameEditorViewProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'onChange'> {
  src: IFrameInfo;
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
    src, data, on_click_frame, on_frame_change, on_click_goto_next_frame,
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

  const [editing, set_editing] = useState<TabEnum>();
  const [changed, set_changed] = useState(false);

  const [frame, set_frame] = useState(() => JSON.parse(JSON.stringify(src)) as IFrameInfo);
  useEffect(() => { set_frame(src) }, [src]);

  useEffect(() => {
    ref_on_frame_change.current?.(frame, data)
    set_changed(JSON.stringify(frame) !== JSON.stringify(src))
  }, [data, frame, src])

  const { pic, bdy, itr, centerx, centery } = frame;
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

  }, [pic, files, zip, centerx, centery, bdy, itr, data, frame]);

  const edit_string = (key: keyof IFrameInfo): InputProps => ({
    value: (frame[key] as any) || '',
    onChange: e => set_frame(p => ({ ...p, [key]: e.target.value.trim() })),
    placeholder: key,
  });
  const edit_number_00 = (key: keyof IFrameInfo): InputProps => ({
    type: 'number',
    step: 0.01,
    value: num_or(frame[key], void 0),
    onChange: e => {
      if (!e.target.value) {
        set_frame(p => ({ ...p, [key]: void 0 }))
      } else {
        const num = Number(Number(e.target.value.trim()).toFixed(2))
        set_frame(p => ({ ...p, [key]: num }))
      }
    }
  });
  const edit_int = (key: keyof IFrameInfo): InputProps => ({
    type: 'number',
    step: 1,
    value: num_or(frame[key], void 0),
    onChange: e => set_frame(p => ({ ...p, [key]: Number(e.target.value.trim()) })),
    placeholder: key,
  });
  const edit_uint = (key: keyof IFrameInfo): InputProps => ({
    type: 'number',
    step: 1,
    min: 0,
    value: num_or(frame[key], void 0),
    onChange: e => set_frame(p => ({ ...p, [key]: Number(e.target.value.trim()) })),
    placeholder: key,
  });
  const edit_num_select = (key: keyof IFrameInfo) => ({
    value: num_or(frame[key], void 0),
    onChange: (e: React.ChangeEvent<HTMLSelectElement>) => set_frame(p => ({ ...p, [key]: Number(e.target.value.trim()) })),
    placeholder: key,
  });

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
    const ret: React.ReactNode[] = map_arr(frame.next, (n, idx) => {
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
  }, [frame, frames, data])
  return (
    <Combine
      id={`${data.id}###${frame.id}`}
      direction='column'
      className={classNames(styles.frame_editor_view, { selected })}
      tabIndex={-1}
      {..._p}
      onClick={(e) => {
        const ele = e.target as HTMLElement;
        if (ele.tagName === 'DIV')
          ref_on_click_frame.current?.(frame, data)
      }}>
      <Frame
        style={{
          padding: 5,
          overflow: 'hidden',
          flexShrink: 0,
          display: 'flex',
          flexDirection: 'column',
          gap: 5
        }}>
        <Titled title='　　　　动作'>
          <Combine>
            <Input {...edit_string('id')} disabled={!editing} style={{ width: 80 }} />
            <Input {...edit_string('name')} disabled={!editing} style={{ width: 150 }} />
            {/* <Button onClick={() => set_editing(v => !v)}>编辑</Button> */}
            <Show show={editing && changed}>
              <Button onClick={() => set_frame(JSON.parse(JSON.stringify(src)) as IFrameInfo)} style={{ flex: 1 }}>
                重置
              </Button>
            </Show>
          </Combine>
        </Titled>
        <TabButtons
          style={{ alignSelf: 'center' }}
          value={editing}
          items={Object.values(TabEnum)}
          parse={v => [v, tab_labels[v]]}
          onChange={v => set_editing(prev => v === prev ? void 0 : v)} />
        <Show show={editing === 'base'}>
          <Titled title='　　　　状态'>
            <Combine>
              <Select
                {...STATE_SELECT_PROPS}
                {...edit_num_select('state')} />
            </Combine>
          </Titled>
          <Titled title='　　　　锚点'>
            <Combine>
              <Input {...edit_int('centerx')} placeholder="x" style={{ width: 80 }} />
              <Input {...edit_int('centery')} placeholder="y" style={{ width: 80 }} />
            </Combine>
          </Titled>
          <Titled title='　　　　下帧'>
            <Combine>
              <Input {...edit_uint('wait')}
                title="当前动作持续多少帧数"
                placeholder="wait"
                style={{ width: 50, boxSizing: 'border-box' }} />
              <Combine direction='column'>
                {next_frame_selects}
              </Combine>
            </Combine>
          </Titled>
          <Titled title='　　　　速度'>
            <Combine>
              <Input {...edit_number_00('dvx')} prefix="x" style={{ width: 80 }} />
              <Input {...edit_number_00('dvy')} prefix="y" style={{ width: 80 }} />
              <Input {...edit_number_00('dvz')} prefix="z" style={{ width: 80 }} />
            </Combine>
          </Titled>
          <Titled title='　　　加速度'>
            <Combine>
              <Input {...edit_number_00('acc_x')} prefix="x" style={{ width: 80 }} />
              <Input {...edit_number_00('acc_y')} prefix="y" style={{ width: 80 }} />
              <Input {...edit_number_00('acc_z')} prefix="z" style={{ width: 80 }} />
            </Combine>
          </Titled>
          <Titled title='　　速度模式'>
            <Combine>
              <Select {...SPEED_MODE_SELECT_PROPS} {...edit_num_select('vxm')} style={{ width: 80, boxSizing: 'border-box' }} />
              <Select {...SPEED_MODE_SELECT_PROPS} {...edit_num_select('vym')} style={{ width: 80, boxSizing: 'border-box' }} />
              <Select {...SPEED_MODE_SELECT_PROPS} {...edit_num_select('vzm')} style={{ width: 80, boxSizing: 'border-box' }} />
            </Combine>
          </Titled>
          <Titled title='　　操作速度'>
            <Combine>
              <Input {...edit_number_00('ctrl_spd_x')} prefix="x" style={{ width: 80 }} />
              <Input {...edit_number_00('ctrl_spd_y')} prefix="y" style={{ width: 80 }} />
              <Input {...edit_number_00('ctrl_spd_z')} prefix="z" style={{ width: 80 }} />
            </Combine>
          </Titled>
          <Titled title='　操作加速度'>
            <Combine>
              <Input {...edit_number_00('ctrl_acc_x')} prefix="x" style={{ width: 80 }} />
              <Input {...edit_number_00('ctrl_acc_y')} prefix="y" style={{ width: 80 }} />
              <Input {...edit_number_00('ctrl_acc_z')} prefix="z" style={{ width: 80 }} />
            </Combine>
          </Titled>
          <Titled title='操作速度模式'>
            <Combine>
              <Select {...SPEED_MODE_SELECT_PROPS} {...edit_num_select('ctrl_spd_x_m')} style={{ width: 80, boxSizing: 'border-box' }} />
              <Select {...SPEED_MODE_SELECT_PROPS} {...edit_num_select('ctrl_spd_y_m')} style={{ width: 80, boxSizing: 'border-box' }} />
              <Select {...SPEED_MODE_SELECT_PROPS} {...edit_num_select('ctrl_spd_z_m')} style={{ width: 80, boxSizing: 'border-box' }} />
            </Combine>
          </Titled>
        </Show>
        <Show show={editing === 'itr'}>
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
            frame.itr && map_arr(frame.itr, (itr, idx) => {
              const name = `itr_${idx}`;
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
                hit_sounds: []
              }
              if (next.bdy) next.bdy = [bdy, ...next.bdy]
              else next.bdy = [bdy]
              return next;
            })
          }}>
            add bdy
          </Button>
          {
            frame.bdy && map_arr(frame.bdy, (bdy, idx) => {
              const name = `bdy_${idx}`
              return (
                <Frame key={name} label={name} tabIndex={-1}>
                  <Button style={{ position: 'absolute', right: 0, top: 0, border: 'none' }}
                    onClick={() => {
                      set_frame(prev => {
                        const next: IFrameInfo = { ...prev };
                        next.bdy?.splice(idx, 1)
                        if (next.bdy?.length) next.bdy = [...next.bdy]
                        if (!next.bdy?.length) delete next.bdy;
                        return next;
                      })
                    }}>
                    🗑️
                  </Button>
                  <Space direction="column">
                    <Titled title='　状态'>
                      <Select {...ITR_KIND_SELECT_PROPS} />
                    </Titled>
                    <Titled title='　　盒'>
                      <Combine direction="column">
                        <Combine>
                          <Input type="number" value={bdy.x} title="x" placeholder="x" style={{ width: 80 }} />
                          <Input type="number" value={bdy.y} title="y" placeholder="y" style={{ width: 80 }} />
                          <Input type="number" value={bdy.z} title="z" placeholder="z" style={{ width: 80 }} />
                        </Combine>
                        <Combine>
                          <Input type="number" value={bdy.w} title="w" placeholder="w" style={{ width: 80 }} />
                          <Input type="number" value={bdy.h} title="h" placeholder="h" style={{ width: 80 }} />
                          <Input type="number" value={bdy.l} title="l" placeholder="l" style={{ width: 80 }} />
                        </Combine>
                      </Combine>
                    </Titled>
                  </Space>
                </Frame>
              )
            })
          }

        </Show>
      </Frame>
    </Combine>
  );
}

