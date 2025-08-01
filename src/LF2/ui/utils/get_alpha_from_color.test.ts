import { get_alpha_from_color } from "./get_alpha_from_color";

test("get_alpha_from_str", () => {
  expect(get_alpha_from_color('rgba(0,0,0,0.5)')).toBe(0.5)
  expect(get_alpha_from_color('argb(0.5,0,0,0.5)')).toBe(0.5)
  expect(get_alpha_from_color('argb(0.5,0,0,0.5)')).toBe(0.5)
  expect(get_alpha_from_color('#000000FF')).toBe(1)
  expect(get_alpha_from_color('0X000000FF')).toBe(1)
  expect(get_alpha_from_color('0x000000FF')).toBe(1)
  expect(get_alpha_from_color('rgb(0.5, 0, 0)')).toBe(null)
})