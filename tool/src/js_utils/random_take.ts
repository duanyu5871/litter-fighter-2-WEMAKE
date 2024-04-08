export default function random_take<T>(array: T[]): T {
  const max = array.length - 1;
  if (max === 0) return array[0];
  const idx = Math.floor(Math.random() * (max + 1));
  return array.splice(idx, 1)[0];
}
