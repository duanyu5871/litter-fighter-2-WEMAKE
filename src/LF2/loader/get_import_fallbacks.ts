
/**
 * 获取后备名
 * 
 * @export
 * @todo 也许使“引入名”变明确才更合适，而不是找好几次
 * @param {string} name 引入名
 * @returns {string[]} 备选引入名列表
 */
export default function get_import_fallbacks(name: string): string[] {
  const fallbacks = [name];
  if (
    name.endsWith('.png') ||
    name.endsWith('.bmp') ||
    name.endsWith('.webp')
  ) {
    const regexp = /(.*)\/(.*)(\.png|\.webp|\.bmp)$/
    const l = [
      name.replace(regexp, (_, dir, name) => dir + '/@4x/' + name + '.webp'),
      name.replace(regexp, (_, dir, name) => dir + '/@4x/' + name + '.png'),
      name.replace(regexp, (_, dir, name) => dir + '/@3x/' + name + '.webp'),
      name.replace(regexp, (_, dir, name) => dir + '/@3x/' + name + '.png'),
      name.replace(regexp, (_, dir, name) => dir + '/@2x/' + name + '.webp'),
      name.replace(regexp, (_, dir, name) => dir + '/@2x/' + name + '.png'),
      name.replace(regexp, (_, dir, name) => dir + '/' + name + '.webp'),
      name.replace(regexp, (_, dir, name) => dir + '/' + name + '.png'),
    ].filter(v => v !== name)
    fallbacks.unshift(...l);
  }
  if (name.endsWith('.wav') || name.endsWith('.wma')) {
    fallbacks.unshift(name + '.mp3');
    fallbacks.unshift(name.substring(0, name.length - 4) + '.mp3');
    // >> a.wav
    // << [a.mp3, a.wav.mp3, a.wav]
  }
  return fallbacks;
}
