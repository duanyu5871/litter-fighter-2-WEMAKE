
let _new_id = 0;
export const new_id = () => '' + (++_new_id);
let __team__ = 4;
export const new_team = () => {
  if (__team__ === Number.MAX_SAFE_INTEGER)
    return '' + (__team__ = Number.MIN_SAFE_INTEGER);
  else if (__team__ === 0)
    return '' + (__team__ = 5)
  return '' + (++__team__)
};