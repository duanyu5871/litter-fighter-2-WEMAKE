import fs from 'fs/promises';
import dat_to_json from '../../../src/LF2/dat_translator/dat_2_json';
import { ICharacterData, IDataLists } from '../../../src/LF2/defines';
import { read_lf2_dat_file } from './read_lf2_dat_file';

export type IRet = ReturnType<typeof dat_to_json>
export async function convert_dat_file(
  out_dir: string, src_dir: string, src_path: string, indexes: IDataLists
): Promise<[IRet, string]> {
  const dst_path = src_path.replace(src_dir, out_dir).replace(/\.dat$/, '.json');
  const index_file_value = dst_path.replace(out_dir + '/', '');
  const index_info = indexes.objects.find(v => index_file_value === v.file) ||
    indexes.backgrounds.find(v => index_file_value === v.file);

  const txt = await read_lf2_dat_file(src_path);
  const ret = dat_to_json(txt, index_info);
  {
    let dirty = ret as Partial<ICharacterData>;
    if (dirty?.frames?.[3]?.opoint) delete dirty.frames[3].opoint;
  }
  if (!ret) {
    console.log('convert failed', src_path, '=>', dst_path);
    await fs.copyFile(src_path, dst_path);
    return [void 0, dst_path];
  }
  console.log('convert', src_path, '=>', dst_path);
  await fs.writeFile(dst_path, JSON.stringify(ret, null, 2));
  return [ret, dst_path];
}
