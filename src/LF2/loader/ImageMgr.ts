import { ISize } from "splittings/dist/es/splittings";
import * as THREE from "three";
import { create_img_ele } from "../../Utils/create_img_ele";
import { get_blob } from "../../Utils/get_blob";
import type LF2 from "../LF2";
import AsyncValuesKeeper from "../base/AsyncValuesKeeper";
import { ILegacyPictureInfo } from "../defines/ILegacyPictureInfo";
import type IPicture from "../defines/IPicture";
import { IPictureInfo } from "../defines/IPictureInfo";
import { IRect } from "../defines/IRect";
import type IStyle from "../defines/IStyle";
import { MagnificationTextureFilter } from "../defines/MagnificationTextureFilter";
import { MinificationTextureFilter } from "../defines/MinificationTextureFilter";
import { TextureWrapping } from "../defines/TextureWrapping";
import Ditto from "../ditto";
import { IImageInfo } from "./IImageInfo";
import { ImageInfo } from "./ImageInfo";
import { TextImageInfo } from "./TextImageInfo";

export type TPicture = IPicture<THREE.Texture>;
export const texture_loader = new THREE.TextureLoader();
export class ImageMgr {
  protected infos = new AsyncValuesKeeper<ImageInfo>();
  readonly lf2: LF2;
  constructor(lf2: LF2) {
    this.lf2 = lf2;
  }

  async create_img_info(key: string, src: string, operations?: ImageOperation[]): Promise<ImageInfo> {
    const [blob_url, src_url] = await this.lf2.import_resource(src);
    const img = await create_img_ele(blob_url);

    const scale = Math.max(1,
      Number(
        src_url.match(/@(\d)[x|X](.png|.webp)$/)?.[1] ??
        src_url.match(/@(\d)[x|X]\/(.*)(.png|.webp)$/)?.[1]
      ) || 1
    )
    if (!operations?.length) {
      return new ImageInfo({
        key,
        url: blob_url,
        src_url,
        scale,
        w: img.width,
        h: img.height,
      });
    }

    let cvs: HTMLCanvasElement | null = null
    for (const op of operations) cvs = this.edit_image(cvs || img, op)

    const blob = await get_blob(cvs!).catch((e) => {
      const err = new Error(e.message + " key:" + key);
      Object.assign(err, { cause: e.cause })
      throw err
    });
    const url = URL.createObjectURL(blob);
    return new ImageInfo({ key, url, src_url, scale, w: cvs!.width, h: cvs!.height });
  }

  protected async _make_img_info_by_text(
    key: string,
    text: string,
    style: IStyle = {},
  ): Promise<TextImageInfo> {
    const cvs = document.createElement("canvas");
    const ctx = cvs.getContext("2d");
    if (!ctx) throw new Error("can not get context from canvas");

    const {
      padding_b = 2,
      padding_l = 2,
      padding_r = 2,
      padding_t = 2,
    } = style;
    const text_align = style.text_align ?? "left";
    const apply_text_style = () => {
      ctx.font = style.font ?? "normal 9px system-ui";
      ctx.fillStyle = style.fill_style ?? "white";
      ctx.strokeStyle = style.stroke_style ?? "";
      ctx.shadowColor = style.shadow_color ?? "";
      ctx.lineWidth = style.line_width ?? 1;
      ctx.textAlign = text_align;
      ctx.shadowBlur = 5;
      ctx.imageSmoothingEnabled = style.smoothing ?? false;
    };
    apply_text_style();
    let w = 0;
    let h = 0;
    const scale = 4;
    let lines = text.split("\n").map((line, idx, arr) => {
      const t = idx === arr.length ? line + "\n" : line;
      const {
        width,
        fontBoundingBoxAscent: a,
        fontBoundingBoxDescent: d,
      } = ctx.measureText(t);
      const ret = { x: 0, y: h + a, t, w: width };
      w = Math.max(w, width);
      h += a + d;
      return ret;
    });
    if (text_align === "center") for (const l of lines) l.x = Math.round(w / 2);
    else if (text_align === "right") for (const l of lines) l.x = Math.round(w);
    cvs.style.width = (cvs.width = scale * (w + padding_l + padding_r)) + "px";
    cvs.style.height =
      (cvs.height = scale * (h + padding_t + padding_b)) + "px";

    apply_text_style();
    ctx.save();
    ctx.scale(scale, scale);
    for (const { x, y, t } of lines) {
      ctx.fillText(t, padding_l + x, padding_t + y);
    }
    ctx.restore();
    const blob = await get_blob(cvs).catch((e) => {
      const err = new Error(e.message + " key:" + key);
      Object.assign(err, { cause: e.cause })
      throw err
    });
    const url = URL.createObjectURL(blob);
    return new TextImageInfo().merge({
      key,
      url,
      scale: scale,
      src_url: url,
      w: cvs.width,
      h: cvs.height,
      text: text,
    });
  }

  find(key: string): ImageInfo | undefined {
    return this.infos.get(key);
  }

  find_by_pic_info(f: IPictureInfo | ILegacyPictureInfo): ImageInfo | undefined {
    return this.infos.get(this._gen_key(f));
  }

  load_text(text: string, style: IStyle = {}): Promise<ImageInfo> {
    const key = Ditto.MD5(text, JSON.stringify(style));
    const fn = () => this._make_img_info_by_text(key, text, style);
    return this.infos.fetch(key, fn);
  }

  load_img(key: string, src: string, operations?: ImageOperation[]): Promise<ImageInfo> {
    const fn = async () => {
      this.lf2.on_loading_content(`${key}`, 0);
      const info = await this.create_img_info(key, src, operations);
      return info;
    };
    return this.infos.fetch(key, fn);
  }

  remove_img(key: string) {
    const img = this.infos.del(key);
    if (!img) return;
    if (img.url.startsWith("blob:")) URL.revokeObjectURL(img.url);
    return;
  }

  protected _gen_key = (f: ILegacyPictureInfo | IPictureInfo) => {
    if ('row' in f)
      return `${f.path}#${f.cell_w || 0}_${f.cell_h || 0}_${f.row}_${f.col}`;
    return f.path;
  }

  async load_by_e_pic_info(f: ILegacyPictureInfo | IPictureInfo): Promise<ImageInfo> {
    const key = this._gen_key(f);
    return this.load_img(key, f.path);
  }

  async create_pic(key: string, src: string, operations?: ImageOperation[]): Promise<TPicture> {
    const img_info = await this.load_img(key, src, operations);
    return this.p_create_pic_by_img_key(img_info.key);
  }

  create_pic_by_img_info(img_info: IImageInfo, onLoad?: (d: TPicture) => void, onError?: (err: unknown) => void): TPicture {
    const picture = err_pic_info(img_info.key);
    const ret = _create_pic(img_info, picture, onLoad, void 0, onError);
    return ret;
  }

  p_create_pic_by_img_info(img_info: IImageInfo): Promise<TPicture> {
    return new Promise((a, b) => this.create_pic_by_img_info(img_info, a, b))
  }

  create_pic_by_img_key(img_key: string, onLoad?: (d: TPicture) => void, onError?: (err: unknown) => void): TPicture {
    const img_info = this.find(img_key);
    if (!img_info) return err_pic_info();
    return this.create_pic_by_img_info(img_info, onLoad, onError);
  }

  async p_create_pic_by_img_key(img_key: string): Promise<TPicture> {
    if (this.find(img_key)) return new Promise((a, b) => this.create_pic_by_img_key(img_key, a, b))
    await this.lf2.images.load_img(img_key, img_key)
    return new Promise((a, b) => this.create_pic_by_img_key(img_key, a, b))
  }

  create_pic_by_e_pic_info(e_pic_info: ILegacyPictureInfo, onLoad?: (d: TPicture) => void, onError?: (err: unknown) => void): TPicture {
    const img_info = this.find_by_pic_info(e_pic_info);
    const picture = err_pic_info();
    if (!img_info) return picture;
    return _create_pic(img_info, picture, onLoad, void 0, onError);
  }
  p_create_pic_by_e_pic_info(e_pic_info: ILegacyPictureInfo): Promise<TPicture> {
    return new Promise((a, b) => this.create_pic_by_e_pic_info(e_pic_info, a, b))
  }

  async create_pic_by_text(text: string, style: IStyle = {}) {
    const img_info = await this.load_text(text, style);
    return this.p_create_pic_by_img_key(img_info.key);
  }

  dispose() {
    // TODO
  }

  edit_image(src: HTMLCanvasElement | HTMLImageElement, op: ImageOperation): HTMLCanvasElement {
    // debugger
    switch (op.type) {
      case 'crop': {
        // debugger;
        const ret = document.createElement("canvas")
        const w = op.dst_size?.w ?? op.w
        const h = op.dst_size?.h ?? op.h
        const dw = ret.width = w > 0 ? w : src.width;
        const dh = ret.height = h > 0 ? h : src.height;
        const sw = op.w > 0 ? op.w : src.width;
        const sh = op.h > 0 ? op.h : src.height;
        const dst_ctx = ret.getContext('2d');
        dst_ctx?.drawImage(src, op.x, op.y, sw, sh, 0, 0, dw, dh)
        return ret;
      }
      case 'resize': {
        const ret = document.createElement("canvas")
        ret.width = op.w > 0 ? op.w : src.width
        ret.height = op.h > 0 ? op.h : src.height
        const dst_ctx = ret.getContext('2d');
        dst_ctx?.drawImage(src, 0, 0, ret.width, ret.height, 0, 0, src.width, src.height)
        return ret;
      }
    }
  }
}

function _create_pic(
  img_info: IImageInfo,
  pic_info: TPicture = err_pic_info(img_info.key),
  onLoad?: (data: TPicture) => void,
  onProgress?: (event: ProgressEvent) => void,
  onError?: (err: unknown) => void
): TPicture {
  const {
    url, w, h,
    min_filter = MinificationTextureFilter.Nearest,
    mag_filter = MagnificationTextureFilter.Nearest,
    wrap_s = TextureWrapping.MirroredRepeat,
    wrap_t = TextureWrapping.MirroredRepeat,
    scale
  } = img_info;
  const texture = texture_loader.load(url, onLoad ? () => onLoad(pic_info) : void 0, onProgress, onError);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.minFilter = min_filter;
  texture.magFilter = mag_filter;
  texture.wrapS = wrap_s;
  texture.wrapT = wrap_t;
  texture.userData = img_info;
  pic_info.w = w / scale;
  pic_info.h = h / scale;
  pic_info.texture = texture;
  return pic_info;
}

function err_pic_info(id: string = ""): TPicture {
  return {
    id,
    w: 0,
    h: 0,
    texture: error_texture(),
  };
}
export function empty_texture() {
  return texture_loader.load("");
}
export function white_texture() {
  return texture_loader.load(require("./white.png"));
}
function error_texture() {
  return texture_loader.load(require("./error.png"));
}
export interface ImageOperation_Resize extends ISize {
  type: 'resize';
}
export interface ImageOperation_Crop extends IRect {
  type: 'crop';
  dst_size?: ISize;
}
export type ImageOperation = ImageOperation_Crop | ImageOperation_Resize;

