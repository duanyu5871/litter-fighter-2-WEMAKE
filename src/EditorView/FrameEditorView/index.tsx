import classNames from "classnames";
import React, { useContext, useEffect, useMemo, useRef, useState } from "react";
import { Button } from "../../Component/Buttons/Button";
import { ToggleButton } from "../../Component/Buttons/ToggleButton";
import Combine from "../../Component/Combine";
import Frame from "../../Component/Frame";
import { Input, InputProps } from "../../Component/Input";
import Select from "../../Component/Select";
import Show from "../../Component/Show";
import { Space } from "../../Component/Space";
import Titled from "../../Component/Titled";
import { Defines, IBdyInfo, IFrameInfo, IItrInfo, INextFrame } from "../../LF2/defines";
import { BdyKind } from "../../LF2/defines/BdyKind";
import { IEntityData } from "../../LF2/defines/IEntityData";
import { map_arr } from "../../LF2/utils/array/map_arr";
import { shared_ctx } from "../Context";
import { ITR_EFFECT_SELECT_PROPS, ITR_KIND_SELECT_PROPS, SPEED_MODE_SELECT_PROPS, STATE_SELECT_PROPS } from "../EntityEditorView";
import styles from "./styles.module.scss";

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

  const [editing, set_editing] = useState(true);
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
    value: (frame[key] as any) || '',
    onChange: e => set_frame(p => ({ ...p, [key]: Number(e.target.value.trim()) })),
    placeholder: key,
  });
  const edit_int = (key: keyof IFrameInfo): InputProps => ({
    type: 'number',
    step: 1,
    value: (frame[key] as any) || '',
    onChange: e => set_frame(p => ({ ...p, [key]: Number(e.target.value.trim()) })),
    placeholder: key,
  });
  const edit_uint = (key: keyof IFrameInfo): InputProps => ({
    type: 'number',
    step: 1,
    min: 0,
    value: (frame[key] as any) || '',
    onChange: e => set_frame(p => ({ ...p, [key]: Number(e.target.value.trim()) })),
    placeholder: key,
  });
  const edit_num_select = (key: keyof IFrameInfo) => ({
    value: frame[key] as any,
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

  const [editing_itr, set_editing_itr] = useState(false)
  const [editing_bdy, set_editing_bdy] = useState(false)
  const [editing_cpoint, set_editing_cpoint] = useState(false)
  const [editing_opoint, set_editing_opoint] = useState(false)
  const [editing_bpoint, set_editing_bpoint] = useState(false)
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
        else
          console.log(ele.tagName)
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
            <Input {...edit_string('id')} disabled={!editing} style={{ width: 100 }} />
            <Input {...edit_string('name')} disabled={!editing} style={{ width: 150 }} />
            {/* <Button onClick={() => set_editing(v => !v)}>编辑</Button> */}
            <Show show={editing && changed}>
              <Button onClick={() => set_frame(JSON.parse(JSON.stringify(src)) as IFrameInfo)} style={{ flex: 1 }}>
                重置
              </Button>
            </Show>
          </Combine>
        </Titled>
        <Show show={editing}>
          <Titled title='　　　　状态'>
            <Combine>
              <Select
                {...STATE_SELECT_PROPS}
                {...edit_num_select('state')} />
            </Combine>
          </Titled>
          <Titled title='　　　　锚点'>
            <Combine>
              <Input {...edit_int('centerx')} placeholder="x" style={{ width: 100 }} />
              <Input {...edit_int('centery')} placeholder="y" style={{ width: 100 }} />
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
              <Input {...edit_number_00('dvx')} placeholder="x" style={{ width: 100 }} />
              <Input {...edit_number_00('dvy')} placeholder="y" style={{ width: 100 }} />
              <Input {...edit_number_00('dvz')} placeholder="z" style={{ width: 100 }} />
            </Combine>
          </Titled>
          <Titled title='　　　加速度'>
            <Combine>
              <Input {...edit_number_00('acc_x')} placeholder="x" style={{ width: 100 }} />
              <Input {...edit_number_00('acc_y')} placeholder="y" style={{ width: 100 }} />
              <Input {...edit_number_00('acc_z')} placeholder="z" style={{ width: 100 }} />
            </Combine>
          </Titled>
          <Titled title='　　速度模式'>
            <Combine>
              <Select {...SPEED_MODE_SELECT_PROPS} {...edit_num_select('vxm')} style={{ width: 100, boxSizing: 'border-box' }} />
              <Select {...SPEED_MODE_SELECT_PROPS} {...edit_num_select('vym')} style={{ width: 100, boxSizing: 'border-box' }} />
              <Select {...SPEED_MODE_SELECT_PROPS} {...edit_num_select('vzm')} style={{ width: 100, boxSizing: 'border-box' }} />
            </Combine>
          </Titled>
          <Titled title='　　操作速度'>
            <Combine>
              <Input {...edit_number_00('ctrl_spd_x')} placeholder="x" style={{ width: 100 }} />
              <Input {...edit_number_00('ctrl_spd_y')} placeholder="y" style={{ width: 100 }} />
              <Input {...edit_number_00('ctrl_spd_z')} placeholder="z" style={{ width: 100 }} />
            </Combine>
          </Titled>
          <Titled title='　操作加速度'>
            <Combine>
              <Input {...edit_number_00('ctrl_acc_x')} placeholder="x" style={{ width: 100 }} />
              <Input {...edit_number_00('ctrl_acc_y')} placeholder="y" style={{ width: 100 }} />
              <Input {...edit_number_00('ctrl_acc_z')} placeholder="z" style={{ width: 100 }} />
            </Combine>
          </Titled>
          <Titled title='操作速度模式'>
            <Combine>
              <Select {...SPEED_MODE_SELECT_PROPS} {...edit_num_select('ctrl_spd_x_m')} style={{ width: 100, boxSizing: 'border-box' }} />
              <Select {...SPEED_MODE_SELECT_PROPS} {...edit_num_select('ctrl_spd_y_m')} style={{ width: 100, boxSizing: 'border-box' }} />
              <Select {...SPEED_MODE_SELECT_PROPS} {...edit_num_select('ctrl_spd_z_m')} style={{ width: 100, boxSizing: 'border-box' }} />
            </Combine>
          </Titled>
        </Show>
        <Combine style={{ alignSelf: 'center' }}>
          <ToggleButton value={editing_itr} onChange={set_editing_itr}><>itr</><>itr</></ToggleButton>
          <ToggleButton value={editing_bdy} onChange={set_editing_bdy}><>bdy</><>bdy</></ToggleButton>
          <ToggleButton value={editing_cpoint} onChange={set_editing_cpoint}><>cpoint</><>cpoint</></ToggleButton>
          <ToggleButton value={editing_opoint} onChange={set_editing_opoint}><>opoint</><>opoint</></ToggleButton>
          <ToggleButton value={editing_bpoint} onChange={set_editing_bpoint}><>bpoint</><>bpoint</></ToggleButton>
        </Combine>
        <Show show={editing_itr}>
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
              // set_frame(prev => {
              //   const next: IFrameInfo = { ...prev };
              //   // next.itr
              //   return next;
              // })
              const edit_itr = (fn: (itr: IItrInfo) => any) => set_frame(prev => {
                const next: IFrameInfo = { ...prev }
                if (next.itr) {
                  fn(next.itr[idx])
                  next.itr = [...next.itr]
                }
                return next
              })
              return (
                <Frame key={name} label={name} tabIndex={-1}>
                  <Button style={{ position: 'absolute', right: 0, top: 0, border: 'none' }}
                    onClick={() => {
                      set_frame(prev => {
                        const next: IFrameInfo = { ...prev };
                        next.itr?.splice(idx, 1)
                        if (next.itr?.length) next.itr = [...next.itr]
                        if (!next.itr?.length) delete next.itr;
                        return next;
                      })
                    }}>
                    🗑️
                  </Button>
                  <Space direction="column">
                    <Titled title='　状态'>
                      <Select {...ITR_KIND_SELECT_PROPS} value={itr.kind} on_changed={v => edit_itr(itr => itr.kind = v)} />
                    </Titled>
                    <Titled title='　效果'>
                      <Combine>
                        <Select {...ITR_EFFECT_SELECT_PROPS} value={itr.effect} on_changed={v => edit_itr(itr => itr.effect = v)} />
                        <Button onClick={() => edit_itr(itr => delete itr.effect)}>❎</Button>
                      </Combine>
                    </Titled>
                    <Titled title='　　盒'>
                      <Combine direction="column">
                        <Combine>
                          <Input type="number" value={itr.x} onChange={e => edit_itr(itr => itr.x = Number(e.target.value))} title="x" placeholder="x" style={{ width: 100 }} />
                          <Input type="number" value={itr.y} onChange={e => edit_itr(itr => itr.y = Number(e.target.value))} title="y" placeholder="y" style={{ width: 100 }} />
                          <Input type="number" value={itr.z} onChange={e => edit_itr(itr => itr.z = Number(e.target.value))} title="z" placeholder="z" style={{ width: 100 }} />
                        </Combine>
                        <Combine>
                          <Input type="number" value={itr.w} onChange={e => edit_itr(itr => itr.w = Number(e.target.value))} title="w" placeholder="w" style={{ width: 100 }} />
                          <Input type="number" value={itr.h} onChange={e => edit_itr(itr => itr.h = Number(e.target.value))} title="h" placeholder="h" style={{ width: 100 }} />
                          <Input type="number" value={itr.l} onChange={e => edit_itr(itr => itr.l = Number(e.target.value))} title="l" placeholder="l" style={{ width: 100 }} />
                        </Combine>
                      </Combine>
                    </Titled>
                  </Space>
                </Frame>
              )
            })
          }
        </Show>
        <Show show={editing_bdy}>
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
                          <Input type="number" value={bdy.x} title="x" placeholder="x" style={{ width: 100 }} />
                          <Input type="number" value={bdy.y} title="y" placeholder="y" style={{ width: 100 }} />
                          <Input type="number" value={bdy.z} title="z" placeholder="z" style={{ width: 100 }} />
                        </Combine>
                        <Combine>
                          <Input type="number" value={bdy.w} title="w" placeholder="w" style={{ width: 100 }} />
                          <Input type="number" value={bdy.h} title="h" placeholder="h" style={{ width: 100 }} />
                          <Input type="number" value={bdy.l} title="l" placeholder="l" style={{ width: 100 }} />
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
      {/* <Show show={editing && changed}>
        <Combine style={{ display: 'flex' }}>
          <Button onClick={() => set_frame(JSON.parse(JSON.stringify(src)) as IFrameInfo)} style={{ flex: 1 }}>
            重置
          </Button>
          <Button style={{ flex: 1 }}>
            确定
          </Button>
        </Combine>
      </Show> */}
    </Combine>
  );
}
