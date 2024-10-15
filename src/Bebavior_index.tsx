
import { useCallback, useEffect, useMemo, useRef } from "react";
import { Vector2 } from "three";
import { __Render } from "./DittoImpl";
import FPS from "./LF2/base/FPS";
import { Bebavior } from "./LF2/behavior";
const CANVAS_PADDING = 100;
const GROUND_W = 500;
const GROUND_H = 500;

class Creature {
  pos = new Vector2(0, 0)
  name = 'Creature';
  color = 'red';
  actor = new Bebavior.Actor();
  update(delta_time: number) {
    this.pos.x = Math.max(this.pos.x, 0)
    this.pos.y = Math.max(this.pos.y, 0)
    this.actor.update(delta_time)
  }
  render(ctx: CanvasRenderingContext2D) {
    ctx.fillStyle = this.color;
    ctx.font = 'bold 20px serif'
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.globalAlpha = 1
    ctx.fillText(this.name, this.pos.x, this.pos.y)
    if (this.actor.behavior?.name) {
      ctx.font = 'bold 12px serif'
      ctx.globalAlpha = 0.5
      ctx.fillText(this.actor.behavior?.name, this.pos.x, this.pos.y + 20)
    }
  }
}

const cat = new Creature();
cat.name = 'Cat';
cat.color = 'white';

const human = new Creature();
human.name = 'You';
human.color = 'white';

const creatures = [cat, human]

const distance_vector = () => cat.pos.clone().sub(human.pos)
const direction = () => distance_vector().normalize();
const is_too_close = () => distance_vector().length() < 100;
const is_too_far = () => distance_vector().length() > 200;
const escaping = () => cat.pos.add(direction())
const closing = () => cat.pos.sub(direction())

enum CatBebaviorEnum {
  escaping_from_human = 'escaping from you',
  interested_in_human = 'interested in you',
  looking_at_human = 'looking at you',
}
cat.actor.add_behavior(
  Bebavior.Noding(CatBebaviorEnum.escaping_from_human).on_update(() => escaping()),
  Bebavior.Noding(CatBebaviorEnum.interested_in_human).on_update(() => closing()),
  Bebavior.Noding(CatBebaviorEnum.looking_at_human),
)
Bebavior.Connecting(cat.actor)
  .start(CatBebaviorEnum.interested_in_human)
  .end(CatBebaviorEnum.looking_at_human)
  .judge(() => !is_too_close() && !is_too_far())
  .done();
Bebavior.Connecting(cat.actor)
  .start(CatBebaviorEnum.escaping_from_human)
  .end(CatBebaviorEnum.looking_at_human)
  .judge(() => !is_too_close() && !is_too_far())
  .done();
Bebavior.Connecting(cat.actor)
  .start(CatBebaviorEnum.looking_at_human)
  .end(CatBebaviorEnum.interested_in_human)
  .judge(() => is_too_far())
  .done();
Bebavior.Connecting(cat.actor)
  .start(CatBebaviorEnum.looking_at_human)
  .end(CatBebaviorEnum.escaping_from_human)
  .judge(() => is_too_close())
  .done();



enum HumanBebaviorEnum {
  Moving = 'moving',
  Standing = 'standing'
}
Bebavior.Connecting(human.actor)
  .done()


cat.actor.use_behavior(CatBebaviorEnum.looking_at_human)
export default function BebaviorNetView() {
  const ref_canvas = useRef<HTMLCanvasElement>(null);
  const ref_ctx = useRef<CanvasRenderingContext2D | null>();
  const ref_pause = useRef(false);
  const ref_time = useRef(0)
  const ref_div_fps = useRef<HTMLDivElement>(null);

  const [fps] = useMemo(() => {
    const fps = new FPS();
    return [fps];
  }, [])

  useEffect(() => {
    ref_ctx.current = ref_canvas.current?.getContext('2d')
  }, [])

  const update_once = useCallback((dt: number) => {
    creatures.forEach(v => v.update(dt))

  }, [])

  const render_once = useCallback((time: number) => {
    const canvas = ref_canvas.current;
    const ctx = ref_ctx.current;
    if (!canvas || !ctx) return;
    const { width, height } = canvas
    canvas.width = width;
    canvas.height = height;

    ctx.translate(CANVAS_PADDING, CANVAS_PADDING)
    ctx.fillStyle = 'green';
    ctx.fillRect(0, 0, GROUND_W, GROUND_H)
    const dt = time - ref_time.current;

    if (!ref_pause.current)
      update_once(dt)

    creatures.forEach(v => v.render(ctx))

    fps.update(time - ref_time.current)
    ref_time.current = time;

    if (ref_div_fps.current)
      ref_div_fps.current.innerText = '' + Math.floor(fps.value)
  }, [update_once, fps])

  useEffect(() => {
    ref_ctx.current = ref_canvas.current?.getContext('2d');
    const _r_id = __Render.add(render_once)
    const on_mousemove = (e: MouseEvent) => {
      human.pos.x = e.offsetX - CANVAS_PADDING;
      human.pos.y = e.offsetY - CANVAS_PADDING;
    }
    document.addEventListener('mousemove', on_mousemove)
    return () => {
      __Render.del(_r_id)
      document.removeEventListener('mousemove', on_mousemove)
    }
  }, [render_once])

  return (
    <div>
      <canvas
        style={{ cursor: 'none' }}
        ref={ref_canvas}
        width={2 * CANVAS_PADDING + GROUND_W + 1}
        height={2 * CANVAS_PADDING + GROUND_H + 1}
        onContextMenu={e => e.preventDefault()} />
    </div>
  )
}