import { Log } from "../../Log";

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

const fetch_not_html = (url: string) => fetch(url)
  .then(async (v) => {
    const content_type = v.headers.get('Content-Type');
    if (!content_type) throw new Error(`Content-Type got ${content_type}`);
    if (content_type.startsWith('text/html')) return;
    const lc_url = url.toLowerCase()
    if (lc_url.endsWith('.json')) {
      if (!content_type.startsWith('application/json'))
        throw new Error(`Content-Type got ${content_type}, expected 'application/json'`)
      return await v.json();
    }
    if (
      lc_url.endsWith('.png') ||
      lc_url.endsWith('.bmp') ||
      lc_url.endsWith('.jpeg') ||
      lc_url.endsWith('.webp')
    ) {
      if (!content_type.startsWith('image/'))
        throw new Error(`Content-Type got ${content_type}, expected start with 'image/'`)
      return URL.createObjectURL(await v.blob())
    }
    if (lc_url.endsWith('.ogg')) {
      if (!content_type.startsWith('audio/ogg'))
        throw new Error(`Content-Type got ${content_type}, expected 'audio/ogg'`)
      return URL.createObjectURL(await v.blob())
    }
    return await v.blob()
  }).catch(e => { Log.print('fetch_any', `url: ${url}, reason:`, e) })

async function import_from_fetch(path: string): Promise<any> {
  const roots = ['lf2_data/', 'lf2_built_in_data/'];
  for (const root of roots) {
    const ret = await fetch_not_html(root + path);
    if (ret) return ret;
  }
  throw new Error(`import_from_fetch(path), failed to fetch resource, path: ${path}`)
}

export async function import_builtin<T = any>(path: string): Promise<T> {
  try { return await import_from_fetch(path) } catch { }
  try { return await import('../../lf2_built_in_data/' + path).then(v => v.default) } catch { }
  throw new Error(`import_builtin(path), failed to import resource, path: ${path}`)
}
