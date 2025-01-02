import { useContext, useEffect, useRef, useState } from "react";
import { Button } from "../Component/Buttons/Button";
import Combine from "../Component/Combine";
import { Input, InputProps } from "../Component/Input";
import Select from "../Component/Select";
import Show from "../Component/Show";
import Titled from "../Component/Titled";
import { IFrameInfo } from "../LF2/defines";
import { IEntityData } from "../LF2/defines/IEntityData";
import { shared_ctx } from "./Context";
import { SPEED_MODE_SELECT_PROPS, STATE_SELECT_PROPS } from "./EntityEditorView";
export const img_map = (window as any).img_map = new Map<string, HTMLImageElement>();
export interface IFrameEditorViewProps extends React.HTMLAttributes<HTMLDivElement> {
  src: IFrameInfo;
  data: IEntityData;
}
export function FrameEditorView(props: IFrameEditorViewProps) {
  const { zip } = useContext(shared_ctx);
  const { src, data, ..._p } = props;
  const ref_canvas = useRef<HTMLCanvasElement>(null);
  const [frame, set_frame] = useState(() => JSON.parse(JSON.stringify(src)) as IFrameInfo);
  const canvas = ref_canvas.current;
  // const drawer = useMemo(() => canvas ? new FrameDrawer(canvas) : null, [canvas])

  useEffect(() => { set_frame(src) }, [src]);
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
    value: ('' + frame[key] as any) || '',
    onChange: e => set_frame(p => ({ ...p, [key]: e.target.value.trim() })),
    placeholder: key,
  });
  const edit_number_00 = (key: keyof IFrameInfo): InputProps => ({
    type: 'number',
    step: 0.01,
    value: ('' + frame[key] as any) || '',
    onChange: e => set_frame(p => {
      if (!e.target.value) return { ...p, [key]: void 0 };
      return { ...p, [key]: Number(e.target.value.trim()) };
    }),
    placeholder: key,
  });
  const edit_num_select = (key: keyof IFrameInfo) => ({
    value: frame[key] as any,
    onChange: (e: React.ChangeEvent<HTMLSelectElement>) => set_frame(p => {
      if (!e.target.value) return { ...p, [key]: void 0 };
      return { ...p, [key]: Number(e.target.value.trim()) };
    }),
    placeholder: key,
  });
  const [editing, set_editing] = useState(false)
  return (
    <div
      className="lf2_hoverable_border"
      tabIndex={-1}
      style={{
        padding: 5, overflow: 'hidden',
        flexShrink: 0, display: 'flex', flexDirection: 'column',
        gap: 5
      }}
      {..._p}>
      <Titled title='　　　　　帧' style={{ marginRight: 5 }}>
        <Combine>
          <Input {...edit_string('id')} disabled={!editing} style={{ width: 100, boxSizing: 'border-box' }} />
          <Input {...edit_string('name')} disabled={!editing} style={{ width: 150, boxSizing: 'border-box' }} />
          <Button onClick={() => set_editing(v => !v)}>✍</Button>
          <Show show={editing}>
            <Button onClick={() => set_frame(JSON.parse(JSON.stringify(src)) as IFrameInfo)}>
              ❌
            </Button>
          </Show>
        </Combine>
      </Titled>
      <Titled title='　　　　预览' style={{ marginRight: 5 }}>
        <canvas ref={ref_canvas} className="lf2_hoverable_border" />
      </Titled>
      <Show show={editing} >
        <Titled title='　　　　状态' style={{ marginRight: 5 }}>
          <Combine>
            <Select
              {...STATE_SELECT_PROPS}
              {...edit_num_select('state')} />
          </Combine>
        </Titled>
        <Titled title='　　　落脚点' style={{ marginRight: 5 }}>
          <Combine>
            <Input {...edit_number_00('centerx')} placeholder="x" style={{ width: 100, boxSizing: 'border-box' }} />
            <Input {...edit_number_00('centery')} placeholder="y" style={{ width: 100, boxSizing: 'border-box' }} />
          </Combine>
        </Titled>
        <Titled title='　　　　速度' style={{ marginRight: 5, display: 'block' }}>
          <Combine>
            <Input {...edit_number_00('dvx')} placeholder="x" style={{ width: 100, boxSizing: 'border-box' }} />
            <Input {...edit_number_00('dvy')} placeholder="y" style={{ width: 100, boxSizing: 'border-box' }} />
            <Input {...edit_number_00('dvz')} placeholder="z" style={{ width: 100, boxSizing: 'border-box' }} />
          </Combine>
        </Titled>
        <Titled title='　　　加速度' style={{ marginRight: 5, display: 'block' }}>
          <Combine>
            <Input {...edit_number_00('acc_x')} placeholder="x" style={{ width: 100, boxSizing: 'border-box' }} />
            <Input {...edit_number_00('acc_y')} placeholder="y" style={{ width: 100, boxSizing: 'border-box' }} />
            <Input {...edit_number_00('acc_z')} placeholder="z" style={{ width: 100, boxSizing: 'border-box' }} />
          </Combine>
        </Titled>
        <Titled title='　　速度模式' style={{ marginRight: 5, display: 'block' }}>
          <Combine>
            <Select {...SPEED_MODE_SELECT_PROPS} {...edit_num_select('vxm')} style={{ width: 100, boxSizing: 'border-box' }} />
            <Select {...SPEED_MODE_SELECT_PROPS} {...edit_num_select('vym')} style={{ width: 100, boxSizing: 'border-box' }} />
            <Select {...SPEED_MODE_SELECT_PROPS} {...edit_num_select('vzm')} style={{ width: 100, boxSizing: 'border-box' }} />
          </Combine>
        </Titled>
        <Titled title='　　操作速度' style={{ marginRight: 5, display: 'block' }}>
          <Combine>
            <Input {...edit_number_00('ctrl_spd_x')} placeholder="x" style={{ width: 100, boxSizing: 'border-box' }} />
            <Input {...edit_number_00('ctrl_spd_y')} placeholder="y" style={{ width: 100, boxSizing: 'border-box' }} />
            <Input {...edit_number_00('ctrl_spd_z')} placeholder="z" style={{ width: 100, boxSizing: 'border-box' }} />
          </Combine>
        </Titled>
        <Titled title='　操作加速度' style={{ marginRight: 5, display: 'block' }}>
          <Combine>
            <Input {...edit_number_00('ctrl_acc_x')} placeholder="x" style={{ width: 100, boxSizing: 'border-box' }} />
            <Input {...edit_number_00('ctrl_acc_y')} placeholder="y" style={{ width: 100, boxSizing: 'border-box' }} />
            <Input {...edit_number_00('ctrl_acc_z')} placeholder="z" style={{ width: 100, boxSizing: 'border-box' }} />
          </Combine>
        </Titled>
        <Titled title='操作速度模式' style={{ marginRight: 5, display: 'block' }}>
          <Combine>
            <Select {...SPEED_MODE_SELECT_PROPS} {...edit_num_select('ctrl_spd_x_m')} style={{ width: 100, boxSizing: 'border-box' }} />
            <Select {...SPEED_MODE_SELECT_PROPS} {...edit_num_select('ctrl_spd_y_m')} style={{ width: 100, boxSizing: 'border-box' }} />
            <Select {...SPEED_MODE_SELECT_PROPS} {...edit_num_select('ctrl_spd_z_m')} style={{ width: 100, boxSizing: 'border-box' }} />
          </Combine>
        </Titled>
      </Show>
    </div >
  );
}
