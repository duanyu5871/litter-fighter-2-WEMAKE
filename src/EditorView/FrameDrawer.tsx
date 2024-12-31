import { IBdyInfo, ICpointInfo, IFrameInfo, IItrInfo, IOpointInfo } from "../LF2/defines";
import { IEntityData } from "../LF2/defines/IEntityData";
import { IRect } from "../LF2/defines/IRect";
import { IZip } from "../LF2/ditto";
import { img_map } from "./FrameEditorView";

export class FrameDrawer {
  canvas: HTMLCanvasElement;
  ctx: CanvasRenderingContext2D | null;
  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
  }
  draw(zip: IZip, data: IEntityData, frame: IFrameInfo) {
    console.log('draw!')
    const { canvas, ctx } = this;
    const { base: { files } } = data;
    const { pic } = frame;
    if (!pic || !canvas || !ctx) return;

    const { bdy, itr, centerx, centery } = frame;

    const pic_info = files[pic.tex];

    if (!pic_info) {
      console.log('pic_info not found: ', pic.tex);
      return;
    }
    let img = img_map.get(pic_info.path);
    if (!img) {
      img_map.set(pic_info.path, img = new Image());
      zip.file(pic_info.path)?.blob_url().then((r) => {
        img!.src = r;
      });
    }
    const draw_bdy = (bdy: IBdyInfo, idx: number, all: IBdyInfo[]) => {
      ctx.strokeStyle = 'green';
      ctx.lineWidth = 1;
      ctx.setLineDash([2, 2]);
      ctx.beginPath();
      ctx.rect(bdy.x + 0.5, bdy.y + 0.5, bdy.w - 1, bdy.h - 1);
      ctx.closePath();
      ctx.stroke();
    };
    const draw_itr = (itr: IItrInfo, idx: number, all: IItrInfo[]) => {
      ctx.strokeStyle = 'red';
      ctx.lineWidth = 1;
      ctx.setLineDash([2, 2]);
      ctx.beginPath();
      ctx.lineDashOffset = 2;
      ctx.rect(itr.x + 0.5, itr.y + 0.5, itr.w - 1, itr.h - 1);
      ctx.closePath();
      ctx.stroke();
    };
    const draw_cpoint = () => {
      if (!frame.cpoint) return;
      ctx.beginPath();
      const { x, y } = frame.cpoint;
      ctx.moveTo(x, y + 2);
      ctx.lineTo(x - 2, y);
      ctx.lineTo(x, y - 2);
      ctx.lineTo(x + 2, y);
      ctx.closePath();
      ctx.setLineDash([]);
      ctx.lineWidth = 1;
      ctx.strokeStyle = 'black';
      ctx.fillStyle = 'yellow';
      ctx.stroke();
      ctx.fill();
      ctx.strokeText('' + frame.cpoint.kind, x + 2, y - 2)
      ctx.fillText('' + frame.cpoint.kind, x + 2, y - 2)
    }
    const draw_wpoint = () => {
      if (!frame.wpoint) return;
      ctx.beginPath();
      const { x, y } = frame.wpoint;
      ctx.moveTo(x, y + 2);
      ctx.lineTo(x - 2, y);
      ctx.lineTo(x, y - 2);
      ctx.lineTo(x + 2, y);
      ctx.closePath();
      ctx.setLineDash([]);
      ctx.lineWidth = 1;
      ctx.strokeStyle = 'black';
      ctx.fillStyle = 'green';
      ctx.stroke();
      ctx.fill();
    }
    const draw_opoint = (op: IOpointInfo) => {
      ctx.beginPath();
      const { x, y } = op;
      ctx.moveTo(x, y + 2);
      ctx.lineTo(x - 2, y);
      ctx.lineTo(x, y - 2);
      ctx.lineTo(x + 2, y);
      ctx.closePath();
      ctx.setLineDash([]);
      ctx.lineWidth = 1;
      ctx.strokeStyle = 'black';
      ctx.fillStyle = 'red';
      ctx.stroke();
      ctx.fill();
      ctx.textAlign = 'center'
      ctx.font = 'light 9px serif'
      ctx.strokeText('' + op.oid, x + 2, y - 5)
      ctx.fillText('' + op.oid, x + 2, y - 5)
    }
    const draw_center = () => {
      ctx.beginPath();
      ctx.moveTo(centerx, centery + 2);
      ctx.lineTo(centerx - 2, centery);
      ctx.lineTo(centerx, centery - 2);
      ctx.lineTo(centerx + 2, centery);
      ctx.closePath();
      ctx.setLineDash([]);
      ctx.lineWidth = 1;
      ctx.strokeStyle = 'black';
      ctx.fillStyle = 'white';
      ctx.stroke();
      ctx.fill();
    };
    const get_bounding = () => {
      let l = 0;
      let t = 0;
      let r = 0;
      let b = 0;
      const ccc = ({ x, y, w, h }: IRect) => {
        l = Math.min(x, l);
        t = Math.min(t, y);
        r = Math.max((x + w) - pic.w, r);
        b = Math.max((y + h) - pic.h, b);
      };
      const ooo = (op: IOpointInfo | ICpointInfo) => {
        let { x, y } = op;
        const w = 50;
        const h = 20;
        x -= 20;
        l = Math.min(x, l);
        t = Math.min(y, t);
        r = Math.max((x + w) - pic.w, r);
        b = Math.max((y + h) - pic.h, b);
      };
      if (Array.isArray(bdy)) bdy.forEach(ccc);
      else if (bdy) ccc(bdy);

      if (Array.isArray(itr)) itr.forEach(ccc);
      else if (itr) ccc(itr);

      if (Array.isArray(frame.opoint)) frame.opoint.forEach(ooo);
      else if (frame.opoint) ooo(frame.opoint);

      if (frame.cpoint) ooo(frame.cpoint);

      return { l, r, t, b };
    };
    const draw_pic_bound = () => {
      ctx.strokeStyle = '#FFFFFF33';
      ctx.lineWidth = 1;
      ctx.setLineDash([2, 2]);
      ctx.beginPath();
      ctx.rect(0, 0, pic.w, pic.h);
      ctx.closePath();
      ctx.stroke();
    };
    const scale = 2
    const draw = () => {
      const { l, r, t, b } = get_bounding();
      canvas.width = (pic.w - l + r + 10) * scale;
      canvas.height = (pic.h - t + b + 10) * scale;
      canvas.style.width = canvas.width + 'px'
      canvas.style.height = canvas.height + 'px'

      ctx.strokeStyle = 'black';
      ctx.beginPath();
      ctx.rect(0, 0, canvas.width, canvas.height);
      ctx.closePath();
      ctx.fill();
      ctx.scale(scale, scale);
      ctx.translate(5 - l, 5 - t);

      draw_pic_bound();
      ctx.drawImage(img!, pic.x, pic.y, pic.w, pic.h, 0, 0, pic.w, pic.h);
      if (Array.isArray(bdy)) bdy.forEach(draw_bdy);
      else if (bdy) draw_bdy(bdy, 0, [bdy]);
      if (Array.isArray(itr)) itr.forEach(draw_itr);
      else if (itr) draw_itr(itr, 0, [itr]);
      draw_center();
      draw_cpoint();
      draw_wpoint();
      if (Array.isArray(frame.opoint)) frame.opoint.forEach(draw_opoint);
      else if (frame.opoint) draw_itr(frame.opoint, 0, [frame.opoint]);
    };
    const on_load = () => setTimeout(() => draw(), 100);
    const on_error = () => { };
    if (!img.complete) {
      img.addEventListener('load', on_load);
      img.addEventListener('error', on_error);
    } else {
      on_load();
    }
  }
}
