
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
  if (name.endsWith('.bmp')) {
    fallbacks.unshift(name + '.png');
    fallbacks.unshift(name.substring(0, name.length - 4) + '.png');
  }
  if (name.endsWith('.wav') || name.endsWith('.wma')) {
    fallbacks.unshift(name + '.ogg');
    fallbacks.unshift(name.substring(0, name.length - 4) + '.ogg');
  }
  return fallbacks;
}
