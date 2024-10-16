
import { useCallback, useEffect, useMemo, useRef } from "react";
import { __Render } from "../../DittoImpl";
import FPS from "../../LF2/base/FPS";
import { Behavior } from "../../LF2/behavior";
import { Creature } from "./Creature";
const CANVAS_PADDING = 100;
const GROUND_W = 500;
const GROUND_H = 500;

const cat = new Creature();
cat.name = 'Cat';
cat.color = 'white';

const human = new Creature();
human.name = 'You';
human.color = 'white';
human.pos.x = GROUND_W / 2
human.pos.y = GROUND_H / 2
const creatures = [cat, human]

const distance_vector = () => cat.pos.clone().sub(human.pos)
const direction = () => distance_vector().normalize();
const is_too_close = () => distance_vector().length() < 100;
const is_too_far = () => distance_vector().length() > 200;
const escaping = () => cat.pos.add(direction())
const closing = () => cat.pos.sub(direction())

enum CatBehaviorEnum {
  escaping_from_human = 'escaping from you',
  interested_in_human = 'interested in you',
  looking_at_human = 'looking at you',
}
cat.actor.add_behavior(
  Behavior.Noding(CatBehaviorEnum.escaping_from_human, cat).on_update((cat) => escaping()),
  Behavior.Noding(CatBehaviorEnum.interested_in_human, cat).on_update(() => closing()),
  Behavior.Noding(CatBehaviorEnum.looking_at_human, cat),
)
Behavior.Connecting(cat.actor)
  .start(CatBehaviorEnum.interested_in_human,1,2)
  .end(CatBehaviorEnum.looking_at_human)
  .judge(() => !is_too_close() && !is_too_far())
  .done();
Behavior.Connecting(cat.actor)
  .start(CatBehaviorEnum.escaping_from_human)
  .end(CatBehaviorEnum.looking_at_human)
  .judge(() => !is_too_close() && !is_too_far())
  .done();
Behavior.Connecting(cat.actor)
  .start(CatBehaviorEnum.looking_at_human)
  .end(CatBehaviorEnum.interested_in_human)
  .judge(() => is_too_far())
  .done();
Behavior.Connecting(cat.actor)
  .start(CatBehaviorEnum.looking_at_human)
  .end(CatBehaviorEnum.escaping_from_human)
  .judge(() => is_too_close())
  .done();

enum HumanBehaviorEnum {
  Moving = 'moving',
  Standing = 'standing'
}
Behavior.Noding(HumanBehaviorEnum.Standing)
  .actor(human.actor)
  .done()
human.actor.use_behavior(HumanBehaviorEnum.Standing)
Behavior.Connecting(human.actor)
  .done()


cat.actor.use_behavior(CatBehaviorEnum.looking_at_human)
export default function BehaviorNetView() {
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