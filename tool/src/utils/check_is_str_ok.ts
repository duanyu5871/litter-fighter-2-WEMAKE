export function check_is_str_ok(...list: string[]) {
  for (const ele of list)
    if (typeof ele !== 'string')
      throw new Error(`未设置${ele}`);
}
