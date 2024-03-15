export function make_import(p: string) {
  return import('../../lf2_data/' + p).catch(() => import('../../lf2_built_in_data/' + p)).then(v => v.default);
}
