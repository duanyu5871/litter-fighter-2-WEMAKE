import { is_str } from './is_str';

export async function check_remote_absolute_path(path: any) {
  if (!is_str(path)) throw new Error('path must be a string!');
  if (!path) throw new Error('path cannot be empty!');
  if (path.trim().length !== path.length) throw new Error('"trim" your path, pls!');
  if (path.indexOf('./') >= 0) throw new Error('"./", "../" is not allowed!');
  if (!path.startsWith('/')) throw new Error('should be an absolute path');
  if (path.indexOf('//') >= 0) throw new Error('"//" is not allowed!');
  if (path.indexOf('\\') >= 0) throw new Error('"\\" is not allowed!');
}
