import { Delay } from "./Delay";
import Easing from "./Easing";
import Sequence from "./Sequence";
import { Sine } from "./Sine";

// test('Animation: Sequence case 0', () => {
//   const anim = new Sequence(
//     new Easing(0, 0, 1500),
//     new Sine(-1, 2, 0.5).set_duration(500),
//     new Easing(1, 1, 1500),
//   )
//   anim.start(true)
//   anim.update(1500);
//   expect(anim.value).toBe(1);
// })
test('Animation: Sequence case 2', () => {
  const anim = new Sequence(
    new Delay(0, 1000),
    new Easing(0, 1).set_duration(1000),
    new Delay(1, 250),
  )
  anim.start(false)
  anim.update(99999);

  anim.start(true)
  anim.update(750);
  expect(anim.anims[1].time).toBe(500);
})