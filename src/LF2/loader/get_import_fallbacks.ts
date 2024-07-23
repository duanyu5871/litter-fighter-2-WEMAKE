
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
    // >> a.bmp
    // << [a.png, a.bmp.png, a.bmp]
  }
  if (name.endsWith('.png')) {
    const n = name.substring(0, name.length - 4)
    fallbacks.unshift(n + '@2x.png');
    fallbacks.unshift(n + '@3x.png');
    fallbacks.unshift(n + '@4x.png');

    // >> a.png
    // << [a@4x.png, a@3x.png, a@2x.png, a.png]
  }
  if (name.endsWith('.wav') || name.endsWith('.wma')) {
    fallbacks.unshift(name + '.mp3');
    fallbacks.unshift(name.substring(0, name.length - 4) + '.mp3');
    // >> a.wav
    // << [a.mp3, a.wav.mp3, a.wav]
  }
  return fallbacks;
}
