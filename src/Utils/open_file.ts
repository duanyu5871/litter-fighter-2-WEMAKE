export interface i_opts_open_file {
  accept?: string;
  multiple?: boolean;
}
export default function open_file(opts?: i_opts_open_file) {
  return new Promise<File[]>((resolve, reject) => {
    const input = document.createElement('input')
    input.type = 'file'
    if (typeof opts?.multiple === 'boolean')
      input.multiple = opts.multiple;
    if (typeof opts?.accept === 'string')
      input.accept = opts.accept
    input.click()
    input.oncancel = () => reject('cancel')
    input.onchange = () => {
      if (!input.files)
        reject('[open_file] files got null!')
      else if (!input.files.length)
        reject('[open_file] files is empty!')
      else
        resolve(Array.from(input.files))
    }
  })
}


export type t_opts_read_file_0 = {
  as: 'ArrayBuffer'
}
export type t_opts_read_file_1 = {
  as: 'BinaryString' | 'DataURL'
}
export type t_opts_read_file_2 = {
  as: 'Text';
  encoding?: string;
}
export type t_opts_read_file = t_opts_read_file_0 | t_opts_read_file_1 | t_opts_read_file_2
export function read_file(file: File, opts: t_opts_read_file_0): Promise<ArrayBuffer>;
export function read_file(file: File, opts: t_opts_read_file_1): Promise<string>;
export function read_file(file: File, opts: t_opts_read_file_2): Promise<string>;
export function read_file(file: File, opts: t_opts_read_file): Promise<string | ArrayBuffer> {
  return new Promise<string | ArrayBuffer>((resolve, reject) => {
    const file_reader = new FileReader();
    switch (opts.as) {
      case 'ArrayBuffer': file_reader.readAsArrayBuffer(file); break;
      case 'BinaryString': file_reader.readAsBinaryString(file); break;
      case 'DataURL': file_reader.readAsDataURL(file); break;
      case 'Text': file_reader.readAsText(file, opts?.encoding); break;
      default: return reject('[read_file] unknown read type!')
    }
    file_reader.onload = () => {
      const r = file_reader.result;
      switch (opts.as) {
        case 'ArrayBuffer':
          if (typeof r === 'string' || !r)
            return reject('[read_file] not ArrayBuffer!')
          else
            return resolve(r)
        case 'BinaryString':
        case 'DataURL':
        case 'Text':
          if (typeof r === 'string') return resolve(r);
          else return reject('[read_file] not string!')
        default: return reject('[read_file] unknown read type!')
      }
    }
  })
}