import { Bodies, Body, Composite, Engine, Events, Mouse, MouseConstraint, Render } from "matter-js";
import { Interval } from "./Interval";
import { Player } from "./Player";
import { Vector2 } from "three";

/** 弹跳传说 */
export class BounceTales {
  protected update_id = 0;
  screen_w = 1280;
  screen_h = 720;
  engine: Engine;
  render: Render;
  mouse_constraint: MouseConstraint;
  grounds: Body[];
  bricks: Body[];
  player: Player;
  key_states = new Map<string, { value: -1 | 0 | 1 | 2; }>();

  protected zoom_px = 0;
  protected zoom_factor = 10;
  protected zoom_speed = 0.25;

  constructor(canvas: HTMLCanvasElement) {
    const w = 10000;
    const h = 600;
    const bs = 1000;
    this.engine = Engine.create({});
    this.render = Render.create({
      engine: this.engine,
      canvas,
      options: {
        width: this.screen_w,
        height: this.screen_h,
      }
    });
    const mouse = Mouse.create(this.render.canvas);
    this.bricks = [
      Bodies.rectangle(400, 200, 100, 100),
      Bodies.rectangle(450, 50, 100, 100)
    ];
    for (let i = 0; i < 100; i++) {
      this.bricks.push(
        Bodies.rectangle(
          Math.random() * w,
          Math.random() * h,
          100,
          100
        )
      )
    }

    this.player = new Player(this);
    this.grounds = [Bodies.rectangle(w / 2, h + bs / 2, w, bs, { isStatic: true }),
    Bodies.rectangle(w / 2, 0 - bs / 2, w, bs, { isStatic: true }),
    Bodies.rectangle(0 - bs / 2, h / 2, bs, h + 60, { isStatic: true }),
    Bodies.rectangle(w + bs / 2, h / 2, bs, h + 60, { isStatic: true })
    ];
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
    Composite.add(this.engine.world, [...this.bricks, this.player.body, ...this.grounds, this.mouse_constraint]);
    this.render.mouse = mouse;
  }
  run() {
    Render.run(this.render);
    Events.on(this.mouse_constraint, 'mousedown', this.on_mousedown);
    Events.on(this.mouse_constraint, 'mouseup', this.on_mouseup);
    Events.on(this.mouse_constraint, 'mousemove', this.on_mousemove);
    document.addEventListener('keydown', this.on_keydown);
    document.addEventListener('keyup', this.on_keyup);
    window.addEventListener("resize", this.on_win_resize);
    this.update_id = Interval.add(this.on_update, 1000 / 60);
    this.on_win_resize();
    return this;
  }
  release() {
    Render.stop(this.render);
    Events.off(this.mouse_constraint, 'mousedown', this.on_mousedown);
    Events.off(this.mouse_constraint, 'mouseup', this.on_mouseup);
    Events.off(this.mouse_constraint, 'mousemove', this.on_mousemove);
    document.removeEventListener('keydown', this.on_keydown);
    document.removeEventListener('keyup', this.on_keyup);
    window.removeEventListener("resize", this.on_win_resize);
    Interval.del(this.update_id);
  }
  on_win_resize = () => {
    this.render.canvas.width = this.render.options.width = window.innerWidth;
    this.render.canvas.height = this.render.options.height = window.innerHeight;
  };
  key_state = (key: string) => this.key_states.get(key);
  is_keydown = (key: string) => {
    const key_state = this.key_states.get(key)?.value;
    return (key_state && key_state > 0) ? 1 : 0;
  };
  is_keyup = (key: string) => this.is_keydown(key) ? 0 : 1;
  on_mousedown = () => { };
  on_mouseup = () => { };
  on_mousemove = () => { };

  on_update = () => {
    Engine.update(this.engine, 1000 / 60);
    const { x, y } = this.player.body.position;
    const velocity_length = Math.sqrt(
      this.player.body.velocity.x * this.player.body.velocity.x +
      this.player.body.velocity.y * this.player.body.velocity.y
    );
    this.zoom_px = this.zoom_px + (this.zoom_factor * velocity_length - this.zoom_px) * this.zoom_speed;
    const viewport_left = this.screen_w / 2;
    const r = this.screen_w / 2;
    const t = this.screen_h * 0.75;
    const b = this.screen_h - t;
    Render.lookAt(this.render, {
      min: {
        x: x - viewport_left - this.zoom_px,
        y: y - t - this.zoom_px
      },
      max: {
        x: x + r + this.zoom_px,
        y: y + b + this.zoom_px
      }
    });
    this.player.update(1000 / 60);
    for (const [, state] of this.key_states) {
      if (state.value === 0) state.value = -1;
      else if (state.value > 0) state.value++;
    }
  };
  on_keydown = (e: KeyboardEvent) => {
    const key = e.key.toLowerCase();
    let key_state = this.key_states.get(key);
    if (!key_state) this.key_states.set(key, key_state = { value: 1 });
    else key_state.value = (key_state.value > 0) ? key_state.value : 1;
  };
  on_keyup = (e: KeyboardEvent) => {
    const key = e.key.toLowerCase();
    let key_state = this.key_states.get(key);
    if (!key_state) this.key_states.set(key, key_state = { value: 0 });
    else key_state.value = 0;
  };
}
