
export function get_import_fallbacks(name: string): string[] {
  const fallbacks = [name];
  if (name.endsWith('.bmp')) {
    fallbacks.unshift(name + '.png')
    fallbacks.unshift(name.substring(0, name.length - 4) + '.png')
  }
  if (name.endsWith('.wav') || name.endsWith('.wma')) {
    fallbacks.unshift(name + '.ogg')
    fallbacks.unshift(name.substring(0, name.length - 4) + '.ogg')
  }
  return fallbacks
}
export async function import_builtin<T = any>(path: string): Promise<T> {
  try { return await import('../../lf2_data/' + path).then(v => v.default) } catch { }
  try { return await import('../../lf2_built_in_data/' + path).then(v => v.default) } catch { }
  throw new Error(`import_builtin(path), failed to import resource, path: ${path}`)
}
