import * as THREE from 'three';
import { get_blob } from '../../Utils/get_blob';
import { get_img } from '../../Utils/get_img';

const temp_canvas = document.createElement('canvas');
const temp_canvas_ctx = temp_canvas.getContext('2d', { willReadFrequently: true });

export type TImageInfo = { url: string; w: number; h: number; }
const image_info_pool = new Map<string, TImageInfo>();

export const texture_loader = new THREE.TextureLoader();
export const simple_picture_info = (path: string): IEntityPictureInfo => ({
  id: 0,
  begin: 0,
  end: 0,
  path,
  w: 0,
  h: 0,
  row: 0,
  col: 0
})
export const load_image = async (f: IEntityPictureInfo, get_src: (f: IEntityPictureInfo) => string): Promise<TImageInfo> => {
  if (!temp_canvas_ctx) throw new Error("can not get context from canvas");
  const key = get_image_key(f);
  let info = image_info_pool.get(key);
  if (info) return info;
  const { path, w, h } = f;
  const img_ele = await get_img(get_src(f));
  temp_canvas.width = img_ele.width;
  temp_canvas.height = img_ele.height;
  temp_canvas_ctx.drawImage(img_ele, 0, 0);
  if (path.endsWith('bmp') && w && h) {
    const img_data = temp_canvas_ctx.getImageData(0, 0, img_ele.width, img_ele.height);
    for (let i = 0; i < img_data.data.length; i += 4) {
      const pidx = i / 4;
      if (pidx % (w + 1) === w) {
        img_data.data[i + 3] = 0;
        continue;
      } else if (Math.floor((pidx / img_ele.width)) % (h + 1) === h) {
        img_data.data[i + 3] = 0;
        continue;
      }
      if (img_data.data[i + 0] === 0 &&
        img_data.data[i + 1] === 0 &&
        img_data.data[i + 2] === 0) {
        img_data.data[i + 3] = 0;
      }
    }

    temp_canvas_ctx.putImageData(img_data, 0, 0);
  }
  const blob = await get_blob(temp_canvas);
  const url = URL.createObjectURL(blob);

  image_info_pool.set(key, info = { url, w: img_ele.width, h: img_ele.height });
  return info
}
export const get_image_key = (f: IEntityPictureInfo) => `${f.path}_${f.w}_${f.h}_${f.row}_${f.col}`
export const find_image_info = (key: string) => image_info_pool.get(key);

export const find_image_info_by_pic_info = (f: IEntityPictureInfo) => image_info_pool.get(get_image_key(f))
export type TPromise = Promise<IPictureInfo<THREE.Texture>> & { picture: IPictureInfo<THREE.Texture> }

export const create_picture = (id: string, pic_info: IEntityPictureInfo) => {
  let _resolve: (info: IPictureInfo<THREE.Texture>) => void;
  let _reject: (reason: any) => void;
  const { url, w: i_w, h: i_h } = find_image_info_by_pic_info(pic_info)!
  let picture: IPictureInfo<THREE.Texture>;
  const on_load = (t: THREE.Texture) => {
    picture.i_w = t.image.width;
    picture.i_h = t.image.height;
    _resolve(picture);
  }
  const on_progress = (e: ProgressEvent) => console.log(`loading texture,id: ${id}, progress: ${Math.floor(100 * e.loaded / e.total)}%`)
  const texture = texture_loader.load(url, on_load, on_progress, e => _reject(e))
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.minFilter = THREE.NearestFilter;
  texture.magFilter = THREE.NearestFilter
  texture.wrapS = THREE.MirroredRepeatWrapping;

  const { w: cell_w, h: cell_h, row, col } = pic_info;
  const ret: TPromise = new Promise((a, b) => { _resolve = a; _reject = b; }) as TPromise
  ret.picture = picture = {
    id,
    texture: texture,
    i_w,
    i_h,
    cell_w: cell_w + 1,
    cell_h: cell_h + 1,
    row,
    col,
  }
  return ret;
}


const sound_pool = new Map<string, string>();
export const load_sound = (key: string, src: string) => {
  sound_pool.set(key, src)
}

export const play_sound = (key: string) => {
  const src_audio = sound_pool.get(key)
  if (!src_audio) return;
  const audio = document.createElement('audio');
  audio.src = src_audio;
  audio.controls = false;
  audio.play();
}