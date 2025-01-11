import { useEffect, useMemo, useRef, useState } from "react";
import EditorView from "../EditorView";
import { useEditor } from "../EditorView/FrameEditorView/useEditor";
import { IRect } from "../LF2/defines/IRect";

interface ISlot {
  t: 'v' | 'h',
  c: ISlot[];
  s: number
}
export default function Editor() {
  // return (
  //   <EditorView style={{ width: '100%', height: '100%', overflow: 'hidden', position: 'relative', padding: 5 }} open />
  // )
  const ref_slot_container = useRef<HTMLDivElement>(null);
  const [slot, slots] = useState<ISlot>(
    {
      t: 'h', s: 0,
      c: [
        {
          t: 'v', s: 0,
          c: []
        },
        {
          t: 'v', s: 0,
          c: [

          ]
        }
      ]
    }
  );
  const [views, set_views] = useState<React.ReactNode[]>([])
  useEffect(() => {
    const r = ref_slot_container.current?.getBoundingClientRect()
    if (!r) return;
    const rects: IRect[] = []
    const root_rect: IRect = {
      x: 0, y: 0,
      w: r.width - 2,
      h: r.height - 2
    }
    function read_slot(slot: ISlot, rect: IRect) {
      if (!slot.c.length) {
        return rects.push(rect);
      }
      for (const c of slot.c) {
        switch (slot.t) {
          case "v": break;
          case "h": break;
        }
        read_slot(c, rect)
      }
    }
    read_slot(slot, root_rect)
    console.log(rects)
    const views = rects.map((r, i) => <div key={i} style={{ width: r.w, height: r.h, position: 'absolute', border: '1px red solid', left: r.x, top: r.y }} />);
    set_views(views)
  }, [slot])


  return (
    <div ref={ref_slot_container} style={{ width: 800, height: 800 }} >{views}</div>
  )
}