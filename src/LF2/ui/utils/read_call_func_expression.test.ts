import { read_call_func_expression } from "./read_call_func_expression";

// test(`read_call_func_expression('func_name')`, () => {
//   const a = read_call_func_expression('func_name');
//   expect(a[0]).toBe('func_name')
//   expect(a[1]?.length).toBe(0)
// })

test(`read_call_func_expression('func_name()')`, () => {
  const a = read_call_func_expression('func_name()');
  expect(a[0]).toBe('func_name')
  expect(a[1]?.length).toBe(0)
})

test(`read_call_func_expression('func_name(hello, world)')`, () => {
  const a = read_call_func_expression('func_name(hello, world)');
  expect(a[0]).toBe('func_name')
  expect(a[1]?.[0]).toBe('hello')
  expect(a[1]?.[1]).toBe('world')
})

// test(`read_call_func_expression('func_name("hello", world)')`, () => {
//   const a = read_call_func_expression('func_name("hello", world)');
//   expect(a[0]).toBe('func_name')
//   expect(a[1]?.[0]).toBe('hello')
//   expect(a[1]?.[1]).toBe('world')
// })

