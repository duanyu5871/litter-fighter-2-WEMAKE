import { useContext, useEffect, useRef, useState } from "react";
import Combine from "../Component/Combine";
import { Input, InputProps } from "../Component/Input";
import Select from "../Component/Select";
import Titled from "../Component/Titled";
import { IBdyInfo, IFrameInfo, IItrInfo } from "../LF2/defines";
import { IEntityData } from "../LF2/defines/IEntityData";
import { shared_ctx } from "./Context";
import { SPEED_MODE_SELECT_PROPS, STATE_SELECT_PROPS } from "./EntityEditorView";
import { IRect } from "../LF2/defines/IRect";


export const img_map = (window as any).img_map = new Map<string, HTMLImageElement>();
export const draw_job_list: (() => void)[] = [];
setInterval(() => {
  if (!draw_job_list.length) return;
  draw_job_list.shift()?.();
  console.log(draw_job_list.length)
}, 16)

export function EntityFrameEditorView(props: { frame: IFrameInfo; data: IEntityData; }) {
  const { zip } = useContext(shared_ctx);
  const { frame: src, data } = props;
  const ref_canvas = useRef<HTMLCanvasElement>(null);
  const [frame, set_frame] = useState(() => ({ ...src }));

  useEffect(() => { set_frame(src) }, [src]);
  const { pic, bdy, itr, centerx, centery } = frame;
  const { base: { files } } = data;
  useEffect(() => {
    if (!pic || !zip || !files) { return }
    const canvas = ref_canvas.current
    const ctx = ref_canvas.current?.getContext('2d')
    if (!canvas || !ctx) return;
    const pic_info = files[pic.tex]
    if (!pic_info) {
      console.log('pic_info not found: ', pic.tex)
      return;
    }
    let img = img_map.get(pic_info.path);
    if (!img) {
      img_map.set(pic_info.path, img = new Image())
      zip.file(pic_info.path)?.blob_url().then((r) => {
        img!.src = r;
      })
    }

    const draw_bdy = (bdy: IBdyInfo, idx: number, all: IBdyInfo[]) => {
      ctx.strokeStyle = 'green'
      ctx.lineWidth = 1
      ctx.setLineDash([2, 2])
      ctx.beginPath()
      ctx.rect(bdy.x + 0.5, bdy.y + 0.5, bdy.w - 1, bdy.h - 1)
      ctx.closePath()
      ctx.stroke();
    }
    const draw_itr = (itr: IItrInfo, idx: number, all: IItrInfo[]) => {
      ctx.strokeStyle = 'red'
      ctx.lineWidth = 1
      ctx.setLineDash([2, 2])
      ctx.beginPath()
      ctx.lineDashOffset = 2
      ctx.rect(itr.x + 0.5, itr.y + 0.5, itr.w - 1, itr.h - 1)
      ctx.closePath()
      ctx.stroke();
    }
    const draw_center = () => {
      ctx.beginPath()
      ctx.moveTo(centerx, centery + 2)
      ctx.lineTo(centerx - 2, centery)
      ctx.lineTo(centerx, centery - 2)
      ctx.lineTo(centerx + 2, centery)
      ctx.closePath();
      ctx.setLineDash([]);
      ctx.lineWidth = 1
      ctx.strokeStyle = 'black'
      ctx.fillStyle = 'white'
      ctx.stroke();
      ctx.fill();
    }
    const get_bounding = () => {
      let l = 0;
      let t = 0;
      let r = 0;
      let b = 0;
      const ccc = ({ x, y, w, h }: IRect) => {
        l = Math.min(x, l);
        y = Math.min(t, y);
        r = Math.max((x + w) - pic.w, r);
        b = Math.max((y + h) - pic.h, b);
      };
      if (Array.isArray(bdy)) bdy.forEach(ccc);
      else if (bdy) ccc(bdy)

      if (Array.isArray(itr)) itr.forEach(ccc);
      else if (itr) ccc(itr)
      return { l, r, t, b }
    }
    const draw_pic_bound = () => {
      ctx.strokeStyle = 'grey'
      ctx.beginPath();
      ctx.rect(0, 0, pic.w, pic.h)
      ctx.closePath();
      ctx.stroke();
    }
    const draw = () => {
      const { l, r, t, b } = get_bounding()
      canvas.width = (pic.w - l + r + 10) * 2;
      canvas.height = (pic.h - t + b + 10) * 2;
      ctx.strokeStyle = 'black'
      ctx.beginPath();
      ctx.rect(0, 0, canvas.width, canvas.height)
      ctx.closePath();
      ctx.fill();

      ctx.scale(2, 2)
      ctx.translate(5 - l, 5 - t)

      draw_pic_bound();
      ctx.drawImage(img!, pic.x, pic.y, pic.w, pic.h, 0, 0, pic.w, pic.h)
      if (Array.isArray(bdy)) bdy.forEach(draw_bdy);
      else if (bdy) draw_bdy(bdy, 0, [bdy])
      if (Array.isArray(itr)) itr.forEach(draw_itr);
      else if (itr) draw_itr(itr, 0, [itr])
      draw_center();
    }
    const on_load = () => draw_job_list.push(draw)
    const on_error = () => {
      debugger;
    }
    if (!img.complete) {
      img.addEventListener('load', on_load)
      img.addEventListener('error', on_error)
    } else {
      on_load()
    }
  }, [pic, files, zip, centerx, centery, bdy, itr]);

  const edit_string = (key: keyof IFrameInfo): InputProps => ({
    value: frame[key] as any,
    onChange: e => set_frame(p => ({ ...p, [key]: e.target.value.trim() })),
    placeholder: key,
  });
  const edit_number_00 = (key: keyof IFrameInfo): InputProps => ({
    type: 'number',
    step: 0.01,
    value: frame[key] as any,
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
  return (
    <div className="lf2_hoverable_border" style={{ padding: 4 }}>
      <canvas ref={ref_canvas} />
      <Titled title='act' style={{ marginRight: 5 }}>
        <Combine>
          <Input {...edit_string('id')} />
          <Input {...edit_string('name')} />
        </Combine>
      </Titled>
      <Titled title='state' style={{ marginRight: 5 }}>
        <Combine>
          <Select
            {...STATE_SELECT_PROPS}
            {...edit_num_select('state')} />
        </Combine>
      </Titled>
      <Titled title='velocity' style={{ marginRight: 5, display: 'block' }}>
        <Combine>
          <Input {...edit_number_00('dvx')} style={{ width: 100 }} />
          <Input {...edit_number_00('dvy')} style={{ width: 100 }} />
          <Input {...edit_number_00('dvz')} style={{ width: 100 }} />
        </Combine>
        <Combine>
          <Input {...edit_number_00('acc_x')} style={{ width: 100 }} />
          <Input {...edit_number_00('acc_y')} style={{ width: 100 }} />
          <Input {...edit_number_00('acc_z')} style={{ width: 100 }} />
        </Combine>
        <Combine>
          <Select {...SPEED_MODE_SELECT_PROPS} {...edit_num_select('vxm')} />
          <Select {...SPEED_MODE_SELECT_PROPS} {...edit_num_select('vym')} />
          <Select {...SPEED_MODE_SELECT_PROPS} {...edit_num_select('vzm')} />
        </Combine>
      </Titled>
      <Titled title='ctrl_spd' style={{ marginRight: 5, display: 'block' }}>
        <Combine>
          <Input {...edit_number_00('ctrl_spd_x')} style={{ width: 100 }} />
          <Input {...edit_number_00('ctrl_spd_y')} style={{ width: 100 }} />
          <Input {...edit_number_00('ctrl_spd_z')} style={{ width: 100 }} />
        </Combine>
        <Combine>
          <Input {...edit_number_00('ctrl_acc_x')} style={{ width: 100 }} />
          <Input {...edit_number_00('ctrl_acc_y')} style={{ width: 100 }} />
          <Input {...edit_number_00('ctrl_acc_z')} style={{ width: 100 }} />
        </Combine>
        <Combine>
          <Select {...SPEED_MODE_SELECT_PROPS} {...edit_num_select('ctrl_spd_x_m')} />
          <Select {...SPEED_MODE_SELECT_PROPS} {...edit_num_select('ctrl_spd_y_m')} />
          <Select {...SPEED_MODE_SELECT_PROPS} {...edit_num_select('ctrl_spd_z_m')} />
        </Combine>
      </Titled>
    </div>
  );
}
