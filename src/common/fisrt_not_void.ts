

export function fisrt_not_void<T, R>(iterable: Iterable<T>, p: (v: T) => R): R | undefined {
  for (const item of iterable) {
    const r = p(item);
    if (r !== null && r !== void 0)
      return r;
  }
  return void 0;
}
