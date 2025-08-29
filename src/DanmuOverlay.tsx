import { useEffect, useRef, useState } from "react";
import { ILf2Callback } from "./LF2/ILf2Callback";
import { LF2 } from "./LF2/LF2";
import { DanmuGameLogic } from "./LF2/ui/component/DanmuGameLogic";
import { UIComponent } from "./LF2/ui/component/UIComponent";

export class DanmuOverlayLogic implements ILf2Callback {
  lf2: LF2;
  component: DanmuGameLogic | undefined;
  timer: ReturnType<typeof setInterval> | null = null;
  ele: HTMLDivElement | null = null;
  constructor(lf2: LF2) {
    this.lf2 = lf2;
    this.lf2.callbacks.add(this)
  }
  release() {
    this.lf2.callbacks.del(this)
  }
  on_component_broadcast(component: UIComponent, msg: string) {
    if (msg === DanmuGameLogic.BROADCAST_ON_START) {
      this.component = component as DanmuGameLogic
      this.open?.();
      if (this.timer) clearInterval(this.timer)
      this.timer = setInterval(() => this.update(), 1000)
      this.update()
    } else if (msg === DanmuGameLogic.BROADCAST_ON_STOP) {
      this.component = component as DanmuGameLogic
      this.close?.();
      if (this.timer) clearInterval(this.timer)
      this.timer = null
    }
  }
  update(): void {
    const { ele, component } = this;
    if (!ele || !component) return;
    ele.innerHTML = ''

    const team_sum = Array.from(component.team_sum.values()).sort((b, a) => {
      return a.kills - b.kills
    })
    for (const sum of team_sum)
      ele.innerHTML += `队伍${sum.team}: ${sum.kills} / ${sum.deads} / ${sum.spawns} / ${sum.damages}\n`
    const fighter_sum = Array.from(component.fighter_sum.values()).sort((b, a) => {
      return a.kills - b.kills
    })
    for (const sum of fighter_sum)
      ele.innerHTML += `${sum.data.base.name}: ${sum.kills} / ${sum.deads} / ${sum.spawns} / ${sum.damages}\n`
  }
  close?(): void;
  open?(): void;
}
export function DanmuOverlay(props: { lf2: LF2 | undefined }) {
  const { lf2 } = props;
  const ref_div = useRef<HTMLDivElement | null>(null);
  const [open, set_open] = useState(false);

  useEffect(() => {
    if (!lf2) return;
    const ele = ref_div.current;
    if (!ele) return;
    const logic = new DanmuOverlayLogic(lf2)
    logic.ele = ele;
    logic.open = () => set_open(true);
    logic.close = () => set_open(false);
    return () => logic.release()
  }, [lf2, ref_div])

  return (
    <div ref={ref_div} style={{
      position: 'fixed',
      color: 'white',
      pointerEvents: 'none',
      display: open ? 'block' : 'none',
      whiteSpace: 'pre-wrap',
      // WebkitTextStrokeColor: 'black',
      // WebkitTextStrokeWidth: 1,
      fontSize: 20,
      opacity: 0.8,
      fontFamily: '"Arial Black", Arial',
      textShadow: `-1px 1px 0 #000, 1px 1px 0 #000,1px -1px 0 #000,-1px -1px 0 #000`
    }} />
  )
}