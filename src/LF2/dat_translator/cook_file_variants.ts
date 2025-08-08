import { IEntityData } from "../defines";
import { ILegacyPictureInfo } from "../defines/ILegacyPictureInfo";

export function cook_file_variants(ret: IEntityData) {
  const file_keys = Object.keys(ret.base.files);
  if (!file_keys.length || file_keys.length % 2 !== 0)
    return;
  file_keys.sort();
  let has_variant = true;
  for (let i = 0; i < file_keys.length / 2; ++i) {
    const file_1 = ret.base.files[file_keys[i]] as ILegacyPictureInfo;
    const file_2 = ret.base.files[file_keys[i + file_keys.length / 2]] as ILegacyPictureInfo;
    if (file_1.cell_w !== file_2.cell_w ||
      file_1.cell_h !== file_2.cell_h ||
      file_1.row !== file_2.row ||
      file_1.col !== file_2.col) {
      has_variant = false;
    }
  }
  if (has_variant) {
    for (let i = 0; i < file_keys.length / 2; ++i) {
      const file_1 = ret.base.files[file_keys[i]];
      file_1.variants = [file_keys[i + file_keys.length / 2]];
    }
  }
}

(() => {
  const a = [
    "bandit_0.png", "bandit_1.png",
    "bandit_0b.png", "bandit_1b.png",
    "bandit_0c.png", "bandit_1c.png"
  ]
  const reg = /\.[^.]*$/

  const v_idx_list = [0]
  const first_str = a[0].replace(reg, '')
  for (let i = 0; i < 16; ++i) {
    const letter = String.fromCharCode(98 + i);
    const v_idx = a.findIndex(v => v.replace(reg, '') === first_str + letter);
    if (v_idx < 1) break;
    v_idx_list.push(v_idx);
  }
  const gap = v_idx_list.reduce<number | boolean>((pre, item, idx, arr) => {
    if (idx === 0) return item;
    const diff = item - arr[idx - 1];
    if (idx === 1) return diff
    return pre == diff ? pre : false
  }, 0)
  if (!gap) return false;


  return gap
})();

