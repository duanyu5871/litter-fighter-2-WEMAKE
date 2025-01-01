export function loop_arr<T>(list: T | T[], fn: (item: T) => any) {
  if (!list) return;
  else if (Array.isArray(list)) list.forEach(fn);
  else fn(list)
}