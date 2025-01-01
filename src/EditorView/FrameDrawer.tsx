import { IBdyInfo, ICpointInfo, IFrameInfo, IFramePictureInfo, IItrInfo, IOpointInfo, IWpointInfo } from "../LF2/defines";
import { IEntityData } from "../LF2/defines/IEntityData";
import { IRect } from "../LF2/defines/IRect";
import { IZip } from "../LF2/ditto";
import { loop_arr } from "../LF2/utils/array/loop_arr";
import { img_map } from "./FrameEditorView";

export class FrameDrawer {
  canvas: HTMLCanvasElement;
  scale = 2
  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
  }

  get_bounding(f: IFrameInfo) {
    const { pic = { w: 0, h: 0 } } = f;
    let l = 0;
    let t = 0;
    let r = 0;
    let b = 0;
    const check_rect = ({ x, y, w, h }: IRect) => {
      l = Math.min(x, l);
      t = Math.min(t, y);
      r = Math.max((x + w) - pic.w, r);
      b = Math.max((y + h) - pic.h, b);
    };
    const check_vec2 = ({ x, y }: { x: number, y: number }) => {
      const w = 50;
      const h = 20;
      x -= 20;
      l = Math.min(x, l);
      t = Math.min(y, t);
      r = Math.max((x + w) - pic.w, r);
      b = Math.max((y + h) - pic.h, b);
    };

    if (f.bdy) loop_arr(f.bdy, bdy => check_rect(bdy))
    if (f.itr) loop_arr(f.itr, itr => check_rect(itr))
    if (f.opoint) loop_arr(f.opoint, opoint => check_vec2(opoint))
    if (f.cpoint) check_vec2(f.cpoint);
    return { l, r, t, b };
  }
  draw_center(ctx: CanvasRenderingContext2D, frame: IFrameInfo) {
    const { centerx, centery } = frame;
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
  }
  draw_bdy(ctx: CanvasRenderingContext2D, bdy: IBdyInfo) {
    ctx.strokeStyle = 'green';
    ctx.lineWidth = 1;
    ctx.setLineDash([2, 2]);
    ctx.beginPath();
    ctx.rect(bdy.x + 0.5, bdy.y + 0.5, bdy.w - 1, bdy.h - 1);
    ctx.closePath();
    ctx.stroke();
  }
  draw_itr(ctx: CanvasRenderingContext2D, itr: IItrInfo) {
    ctx.strokeStyle = 'red';
    ctx.lineWidth = 1;
    ctx.setLineDash([2, 2]);
    ctx.beginPath();
    ctx.lineDashOffset = 2;
    ctx.rect(itr.x + 0.5, itr.y + 0.5, itr.w - 1, itr.h - 1);
    ctx.closePath();
    ctx.stroke();
  }
  draw_cpoint(ctx: CanvasRenderingContext2D, cpoint: ICpointInfo) {
    ctx.beginPath();
    const { x, y } = cpoint;
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
    ctx.strokeText('' + cpoint.kind, x + 2, y - 2)
    ctx.fillText('' + cpoint.kind, x + 2, y - 2)
  }
  draw_wpoint(ctx: CanvasRenderingContext2D, point: IWpointInfo) {
    ctx.beginPath();
    const { x, y } = point;
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
  draw_opoint(ctx: CanvasRenderingContext2D, point: IOpointInfo) {
    ctx.beginPath();
    const { x, y } = point;
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
    ctx.strokeText('' + point.oid, x + 2, y - 5)
    ctx.fillText('' + point.oid, x + 2, y - 5)
  }
  draw_frame_bound(ctx: CanvasRenderingContext2D, pic: IFramePictureInfo) {
    ctx.strokeStyle = '#FFFFFF33';
    ctx.lineWidth = 1;
    ctx.setLineDash([2, 2]);
    ctx.beginPath();
    ctx.rect(0, 0, pic.w, pic.h);
    ctx.closePath();
    ctx.stroke();
  }

  get_img(zip: IZip, data: IEntityData, tex: string): Promise<HTMLImageElement> {
    const { base: { files } } = data;
    const pic = files[tex];
    if (!pic) {
      return Promise.reject(new Error('pic not found: ' + tex))
    }
    const img = img_map.get(pic.path) || new Image();
    if (!img_map.has(pic.path)) {
      img_map.set(pic.path, img);
      zip.file(pic.path)?.blob_url().then((r) => {
        img.src = r;
      })
    }
    return new Promise<HTMLImageElement>((resolve, reject) => {
      const on_load = () => {
        setTimeout(() => resolve(img), 100)
        img.removeEventListener('load', on_load);
        img.removeEventListener('error', on_error);
      }
      const on_error = (e: ErrorEvent) => {
        reject(new Error(e.message))
        img.removeEventListener('load', on_load);
        img.removeEventListener('error', on_error);
      }
      if (img.complete) {
        resolve(img)
      } else {
        img.addEventListener('load', on_load, { once: true });
        img.addEventListener('error', on_error, { once: true });
      }
    })
  }
  async draw(ctx: CanvasRenderingContext2D, zip: IZip, data: IEntityData, frame: IFrameInfo) {

    const { canvas } = this;
    const { pic } = frame;
    if (!pic || !canvas || !ctx) return;

    const img = await this.get_img(zip, data, pic.tex).catch(e => void 0)

    const { l, r, t, b } = this.get_bounding(frame);
    canvas.width = (pic.w - l + r + 10) * this.scale;
    canvas.height = (pic.h - t + b + 10) * this.scale;
    canvas.style.width = canvas.width + 'px'
    canvas.style.height = canvas.height + 'px'

    ctx.strokeStyle = 'black';
    ctx.beginPath();
    ctx.rect(0, 0, canvas.width, canvas.height);
    ctx.closePath();
    ctx.fill();
    ctx.scale(this.scale, this.scale);
    ctx.translate(5 - l, 5 - t);

    if (frame.pic) this.draw_frame_bound(ctx, frame.pic);
    if (img) ctx.drawImage(img, pic.x, pic.y, pic.w, pic.h, 0, 0, pic.w, pic.h);

    if (frame.itr) loop_arr(frame.itr, itr => this.draw_itr(ctx, itr))
    if (frame.bdy) loop_arr(frame.bdy, bdy => this.draw_bdy(ctx, bdy))
    if (frame.opoint) loop_arr(frame.opoint, opoint => this.draw_opoint(ctx, opoint))
    if (frame.cpoint) this.draw_cpoint(ctx, frame.cpoint);
    if (frame.wpoint) this.draw_wpoint(ctx, frame.wpoint);
    this.draw_center(ctx, frame);

  }
}
