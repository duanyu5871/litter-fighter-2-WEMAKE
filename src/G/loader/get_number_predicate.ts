export const get_number_predicate = (operator: string, value: number) => {
  const map: {
    [x in string]?: (v: number) => boolean;
  } = {
    '==': v => v === value,
    '!=': v => v !== value,
    '>=': v => v >= value,
    '<=': v => v <= value,
  };
  return map[operator] || ((_v: number) => false);
};
