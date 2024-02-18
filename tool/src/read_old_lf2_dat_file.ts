import fs from 'fs/promises';

const pwd = 'SiuHungIsAGoodBearBecauseHeIsVeryGood';
const head_placeholder_length = 123

export function decode_dat(arr: { [i in number]: number }, len: number) {
  for (let i = 0; i < len; ++i) arr[i] -= pwd.charCodeAt(i % pwd.length);
}
export async function read_lf2_dat(array_buffer: ArrayBuffer): Promise<String> {
  const buf = new Uint8Array(array_buffer);
  decode_dat(buf, buf.byteLength)
  const char_code_arr = Array.from(buf)
  char_code_arr.splice(0, head_placeholder_length)
  return String.fromCharCode(...char_code_arr);
}
export async function read_lf2_dat_file(path: string): Promise<Buffer> {
  const buf = await fs.readFile(path);
  decode_dat(buf, buf.length)
  const ret = Buffer.alloc(buf.length - head_placeholder_length);
  buf.copy(ret, 0, head_placeholder_length, buf.length);
  return ret;
}
