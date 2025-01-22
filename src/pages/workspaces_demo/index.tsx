import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Button } from "../../Component/Buttons/Button";
import Frame from "../../Component/Frame";
import { ArrowDown } from "../../Component/Icons/ArrowDown";
import { ArrowLeft } from "../../Component/Icons/ArrowLeft";
import { ArrowRight } from "../../Component/Icons/ArrowRight";
import { ArrowUp } from "../../Component/Icons/ArrowUp";
import { Cross } from "../../Component/Icons/Cross";
import { Workspaces } from "../../splittings/src";
import { DomAdapter } from "../../splittings/src/dom/DomAdapter";

export default function WorkspacesDemo() {
  const ref_container = useRef<HTMLDivElement>(null)
  const [views, set_views] = useState<React.ReactNode[]>([]);
  useEffect(() => {
    const adapter = new DomAdapter(ref_container.current!)
    const workspaces = new Workspaces(adapter)
    // const indexes: number[] = []
    // for (let i = 0; i < 10; ++i) {
    //   workspaces.add(indexes, i % 2 ? 'left' : 'down')
    //   indexes.push(0)
    // }
    workspaces.on_leaves_changed = () => {
      let dragging: HTMLElement | null = null;
      let dropping: HTMLElement | null = null;
      set_views(
        workspaces.leaves.map(slot => {
          const cell = adapter.get_cell(slot);
          if (!cell) return null;
          const margin = 2;
          const size = `calc(100% - ${2 * margin}px)`;
          return createPortal(
            <Frame
              style={{ width: size, height: size, margin, overflow: 'hidden' }}
              draggable
              label={slot.id + ' ' + slot.weight.toFixed(3) + ' ' + slot.min_size.w + 'x' + slot.min_size.h}
              onDragStart={(e) => dragging = (e.target as HTMLElement).parentElement}
              onDragEnd={(e) => dragging = null}
              onDragEnter={(e) => {
                dropping = (e.target as HTMLElement).parentElement
                if (dropping === dragging) dropping = null
              }}
              onDragOver={(e) => {
                if (dropping === (e.target as HTMLElement).parentElement)
                  e.preventDefault();
              }}
              onDragLeave={(e) => {
                if (dropping === (e.target as HTMLElement).parentElement)
                  dropping = null
              }}
              onDrop={(e) => {
                if (dragging && dropping) {
                  const dragging_slot = adapter.get_slot(dragging)
                  const dropping_slot = adapter.get_slot(dropping)
                  console.log(dragging_slot, dropping_slot)
                }
                e.preventDefault();
              }}
            >
              <Button onClick={() => workspaces.add(slot.id, 'left')?.confirm()}><ArrowLeft /></Button>
              <Button onClick={() => workspaces.add(slot.id, 'right')?.confirm()}><ArrowRight /></Button>
              <Button onClick={() => workspaces.add(slot.id, 'up')?.confirm()}><ArrowUp /></Button>
              <Button onClick={() => workspaces.add(slot.id, 'down')?.confirm()}><ArrowDown /></Button>
              <Button onClick={() => workspaces.del(slot.id)?.confirm()}><Cross /></Button>
            </Frame>,
            cell,
            cell.id
          )
        })
      )
    }
    workspaces.confirm()
    return () => workspaces.release()
  }, [])

  return <>
    <div ref={ref_container} style={{ width: '100vw', height: '100vh', resize: 'both' }} />
    {views}
  </>
}