import { Bodies, Composite, Engine, Events, Mouse, MouseConstraint, Render, Runner, Body } from "matter-js";
import { useEffect, useRef } from "react";

class Solution {
  engine: Engine;
  runner: Runner;
  render: Render;
  releaser: (() => void)[] = []
  player: Body;
  mouse_constraint: MouseConstraint;
  constructor(canvas: HTMLCanvasElement) {
    const w = 800;
    const h = 600;
    const bs = 1000;
    this.engine = Engine.create({  });
    this.runner = Runner.create();
    this.render = Render.create({ engine: this.engine, canvas });
    const mouse = Mouse.create(this.render.canvas)
    const boxA = Bodies.rectangle(400, 200, 80, 80);
    const boxB = Bodies.rectangle(450, 50, 80, 80);
    this.player = Bodies.circle(400, 100, 50);
    const ground_1 = Bodies.rectangle(w / 2, 0 - bs / 2, w + 60, bs, { isStatic: true });
    const ground_2 = Bodies.rectangle(w / 2, h + bs / 2, w + 60, bs, { isStatic: true });
    const ground_3 = Bodies.rectangle(0 - bs / 2, h / 2, bs, h + 60, { isStatic: true });
    const ground_4 = Bodies.rectangle(w + bs / 2, h / 2, bs, h + 60, { isStatic: true });
    this.mouse_constraint = MouseConstraint.create(this.engine, {
      mouse: mouse,
      constraint: {
        stiffness: 0.01,
        damping: 0.5,
        render: {
          visible: true
        }
      }
    });
    Composite.add(this.engine.world, [boxA, boxB, this.player, ground_1, ground_2, ground_3, ground_4, this.mouse_constraint]);
    this.render.mouse = mouse;
  }
  run() {
    Render.run(this.render)
    Runner.run(this.runner, this.engine)
    this.releaser.forEach(fn => fn())
    this.releaser = [
      Events.on(this.engine, 'afterUpdate', this.on_update),
      Events.on(this.mouse_constraint, 'mousedown', this.on_mousedown),
      Events.on(this.mouse_constraint, 'mouseup', this.on_mouseup),
      Events.on(this.mouse_constraint, 'mousemove', this.on_mousemove),
    ]
  }
  release() {
    this.releaser.forEach(fn => fn())
    Render.stop(this.render)
    Runner.stop(this.runner)
  }
  on_mousedown = () => console.log('on_mousedown')
  on_mouseup = () => console.log('on_mouseup')
  on_mousemove = () => console.log('on_mousemove')
  on_update = () => {
  }
}

export default function MNE() {
  const ref_canvas = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref_canvas.current
    if (!canvas) { debugger; return }

    const solution = new Solution(canvas);
    solution.run()

    return () => {
      solution.release()
    }
  }, [])
  return <canvas ref={ref_canvas} width={800} height={600} />
}