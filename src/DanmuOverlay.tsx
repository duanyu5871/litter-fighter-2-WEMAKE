import { useEffect, useRef, useState } from "react";
import { ILf2Callback } from "./LF2/ILf2Callback";
import { LF2 } from "./LF2/LF2";
import { DanmuGameLogic } from "./LF2/ui/component/DanmuGameLogic";
import { UIComponent } from "./LF2/ui/component/UIComponent";
const n = (nn: number) => nn.toPrecision(2).replace(/0+$/, '').replace(/\.$/, '')

const t = (name: string) => {
  return `<span style="display:inline-block;width:100px">${name}</span>:`
}
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
      const k = a.kills - b.kills;
      if (k) return k
      const d = b.deads - a.deads;
      if (d) return d;
      const s = a.spawns - b.spawns;
      if (s) return s;
      return a.damages - b.damages;
    })
    const fighter_sum = Array.from(component.fighter_sum.values()).sort((a, b) => {
      if (a.spawns && !b.spawns) return -1;
      if (!a.spawns && b.spawns) return 1;
      const k = b.kills - a.kills;
      if (k) return k
      const d = a.deads - b.deads;
      if (d) return d;
      const s = a.spawns - b.spawns;
      if (s) return s;
      return b.damages - a.damages;
    })
    ele.innerHTML += '测试中(数据不保留)🎖️=击败数 ☠️=战败数 🐣=出场数 💥=伤害值 ⚔️=KD值\n'
    ele.innerHTML += '---------------------------------------------------------------\n'
    for (const sum of team_sum) {
      if (!sum.spawns) continue;
      ele.innerHTML += `${t('Team ' + sum.team)} 🎖️|☠️|🐣|💥 = ${sum.kills} | ${sum.deads} | ${sum.spawns} | ${sum.damages}\n`
    }
    ele.innerHTML += '---------------------------------------------------------------\n'
    for (const sum of fighter_sum) {
      const { spawns, kills, deads, damages } = sum;
      if (!spawns) continue;
      const { name } = sum.data.base;
      if (deads)
        ele.innerHTML += `${t(name)} ⚔️|🐣|💥 = ${n(kills / deads)} | ${spawns} | ${damages}\n`
      else if (sum.kills)
        ele.innerHTML += `${t(name)} 🎖️|🐣|💥 = ${n(kills)} | ${spawns} | ${damages}\n`
      else
        ele.innerHTML += `${t(name)} 🐣|💥 = ${spawns} | ${damages}\n`
    }
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
      left: 30,
      top: 100,
      fontSize: 20,
      opacity: 0.7,
      fontFamily: 'Arial',
      textShadow: `-1px 1px 0 #000, 1px 1px 0 #000,1px -1px 0 #000,-1px -1px 0 #000`
    }} />
  )
}