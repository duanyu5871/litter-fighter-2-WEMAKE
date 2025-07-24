import { Sine } from "./Sine"

test('sine', () => {
  const sine = new Sine(-1, 2, 0.5).set_duration(500);

  expect(sine.value).toBe(0)
  sine.update(500);
  expect(sine.value).toBe(1)

  sine.end()
  sine.start(true)
  
  expect(sine.value).toBe(1)
  sine.update(500);
  expect(sine.value).toBe(0)
})

