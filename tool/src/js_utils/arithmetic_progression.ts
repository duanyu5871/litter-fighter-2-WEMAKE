export const arithmetic_progression = (from: number, to: number, gap: number = 1): number[] => {
  const ret = [];
  for (let i = from; i <= to; i += gap) {
    ret.push(i);
  }
  return ret;
};
