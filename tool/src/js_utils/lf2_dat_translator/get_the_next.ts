export const get_next_frame_by_id = (id: number | string): INextFrame => {
  if (id === 1000) return { id: 'gone' };
  if (id === 999) return { id: 'auto' };
  if (id === -999) return { id: 'auto', flags: { turn: 1 } };
  if (id === 0) return { id: 'self' };

  if (typeof id === 'number' && id < 0)
    return { id: -id, flags: { turn: 1 } }
  if (typeof id === 'string' && id.startsWith('-'))
    return { id: id.substring(1), flags: { turn: 1 } }
  return { id: id };
};
