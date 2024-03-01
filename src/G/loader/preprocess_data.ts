import { map, traversal } from '../../js_utils/traversal';
import { image_pool } from './loader';
import { preprocess_frame } from '../preprocess_frame';
import { TData } from '../Entity';

export const data_map = (window as any).data_map = new Map<string, TData>();

export default async function preprocess_data(data: TData, new_id?: string | number): Promise<TData> {
  if (!('frames' in data)) return data;

  const { frames, base: { files } } = data;
  const jobs = map(files, (_, v) => image_pool.load_by_pic_info(v, _ => require('../' + v.path)))
  jobs.push(image_pool.load('shadow', require('../shadow.png')))

  await Promise.all(jobs);

  traversal(frames, (_, frame) => preprocess_frame(data, frame));

  if (!data.id && new_id) {
    data.id = new_id
  }
  const id = ('' + data.id)
  if (data_map.has(id)) {
    console.warn(
      "[preprocess_data] id duplicated, old data will be overwritten!",
      "old data:", data_map.get(id),
      "new data:", data)
  }
  data_map.set(id, data);
  return data;
}
