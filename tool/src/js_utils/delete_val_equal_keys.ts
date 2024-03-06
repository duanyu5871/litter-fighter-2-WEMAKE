export function delete_val_equal_keys<T extends {}>(target: T | undefined | null, keys: (keyof T)[], values: any[]) {
  if (!target) return;
  for (const key of keys) {
    const val = target[key];
    if (values.findIndex(v => v === val) >= 0) {
      delete target[key];
    }
  }
};
