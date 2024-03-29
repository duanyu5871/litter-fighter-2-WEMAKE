import ease_in_out_quint from '../LF2/ease_method/ease_in_out_quint';

export default function fade_out(fun: (opacity: number) => void, duration: number, delay: number = 0): () => void {
  const mem = {
    current: duration + delay,
    prev_time: 0,
    req_id: 0,
  };
  const loop = (curr_time: number) => {
    if (mem.prev_time === 0) {
      mem.prev_time = curr_time;
      mem.req_id = requestAnimationFrame(loop);
      return;
    }
    const dt = curr_time - mem.prev_time;
    mem.current = Math.max(0, mem.current - dt);
    if (mem.current < duration) {
      fun(ease_in_out_quint(mem.current / duration));
    }
    mem.prev_time = curr_time;
    if (mem.current > 0) mem.req_id = requestAnimationFrame(loop);
  };
  mem.req_id = requestAnimationFrame(loop);
  return () => cancelAnimationFrame(mem.req_id);
}
