import * as THREE from 'three';
import { create_picture } from './loader';
import { TData } from '../Entity';


export default function create_pictures(data: TData) {
  const pictures = new Map<string, IPictureInfo<THREE.Texture>>();
  const { base: { files } } = data;
  for (const key of Object.keys(files)) {
    pictures.set(key, create_picture(key, files[key]).picture);
  }
  return pictures;
}
