import * as THREE from 'three';
import { IPictureInfo } from '../../types/IPictureInfo';
import { TData } from '../Entity';
import { create_picture_by_pic_info } from './loader';


export default function create_pictures(data: TData) {
  const pictures = new Map<string, IPictureInfo<THREE.Texture>>();
  const { base: { files } } = data;
  for (const key of Object.keys(files)) {
    pictures.set(key, create_picture_by_pic_info(key, files[key]).data);
  }
  return pictures;
}
