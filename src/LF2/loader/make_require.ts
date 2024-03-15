export function make_require(p: string) {
  const bmp = p.endsWith('.bmp');
  if (bmp) {
    try { return require('../../lf2_data/' + p.replace(/.bmp$/g, '.png')) } catch (e) { }
    try { return require('../../lf2_data/' + p + '.png') } catch (e) { }
  }

  try { return require('../../lf2_data/' + p) } catch (e) { }

  if (bmp) {
    try { return require('../../lf2_built_in_data/' + p.replace(/.bmp$/g, '.png')) } catch (e) { }
    try { return require('../../lf2_built_in_data/' + p + '.png') } catch (e) { }
  }
  try { return require('../../lf2_built_in_data/' + p) } catch (e) { }
}
