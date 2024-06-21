export const get_arg_map = () => {
  let reading: 'key' | 'value' = 'key';
  let cur_key: string = '';
  const arg_map = new Map<string, string>();
  for (let i = 2; i < process.argv.length; ++i) {
    const arg = process.argv[i];
    if (reading === 'key' || arg.startsWith('-')) {
      arg_map.set(cur_key = arg, '');
      reading = 'value';
      continue;
    }
    arg_map.set(cur_key, arg);
    reading = 'key';
  }
  return arg_map;
};
