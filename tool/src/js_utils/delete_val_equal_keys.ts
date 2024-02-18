export function delete_val_equal_keys<T extends {}>(target: T | undefined | null, keys: (keyof T)[], values: any[]) {
  if (!target) return;
  for (const key of keys)
    if (values.find(v => v === target[key]))
      delete target[key];
};
