import * as THREE from 'three';
import { IPictureInfo } from '../../types/IPictureInfo';
import { TData } from '../entity/Entity';
import type LF2 from '../LF2';


export default function create_pictures(lf2: LF2, data: TData) {
  const pictures = new Map<string, IPictureInfo<THREE.Texture>>();
  const { base: { files } } = data;
  for (const key of Object.keys(files)) {
    pictures.set(key, lf2.img_mgr.create_picture_by_pic_info(key, files[key]).data);
  }
  return pictures;
}
