import { Expression } from './Expression';
test("hello expression #1", () => {
  const e = new Expression('', () => false);
  expect(1).toBe(1);
})