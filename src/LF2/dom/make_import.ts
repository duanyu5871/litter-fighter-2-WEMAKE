
export interface IOnProgress { (current: number, total: number): void }

const fetch_not_html = async (url: string, progress?: IOnProgress) => {
  const v = await fetch(url);
  if (url.startsWith('blob:')) return v.blob();

  const content_type = v.headers.get('Content-Type');
  if (!content_type) throw new Error(`Content-Type got ${content_type}`);
  if (content_type.startsWith('text/html')) return;
  const lc_url = url.toLowerCase();
  if (lc_url.endsWith('.json')) {
    if (!content_type.startsWith('application/json'))
      throw new Error(`Content-Type got ${content_type}, expected 'application/json'`);
    return await v.json();
  }
  if (lc_url.endsWith('.png') ||
    lc_url.endsWith('.bmp') ||
    lc_url.endsWith('.jpeg') ||
    lc_url.endsWith('.webp')) {
    if (!content_type.startsWith('image/'))
      throw new Error(`Content-Type got ${content_type}, expected start with 'image/'`);
    return URL.createObjectURL(await v.blob());
  }
  if (lc_url.endsWith('.ogg')) {
    if (!content_type.startsWith('audio/ogg'))
      throw new Error(`Content-Type got ${content_type}, expected 'audio/ogg'`);
    return URL.createObjectURL(await v.blob());
  }
  return v.blob();
}

export async function make_import<T = any>(path: string, progress?: IOnProgress): Promise<T> {
  if (path.startsWith('blob:') || path.startsWith('http:') || path.startsWith('https:')) 
    return await fetch_not_html(path, progress);
  
  const roots = ['lf2_data/', 'lf2_built_in_data/'];
  for (const root of roots) {
    const ret = await fetch_not_html(root + path, progress);
    if (ret) return ret;
  }
  throw new Error(`import_from_fetch(path), failed to fetch resource, path: ${path}`)
}
