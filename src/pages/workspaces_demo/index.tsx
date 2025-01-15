import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import Frame from "../../Component/Frame";
import { Workspaces } from "../../Workspaces";
import { Button } from "../../Component/Buttons/Button";
import { ArrowLeft3 } from "../../Component/Icons/ArrowLeft3";
import { ArrowRight3 } from "../../Component/Icons/ArrowRight3";
import { ArrowDown3 } from "../../Component/Icons/ArrowDown3";
import { ArrowUp3 } from "../../Component/Icons/ArrowUp3";
import { WorkspaceColumnView } from "../../EditorView/WorkspaceColumnView";

export default function WorkspacesDemo() {
  const ref_container = useRef<HTMLDivElement>(null)
  const [views, set_views] = useState<React.ReactNode[]>([]);
  useEffect(() => {
    const workspaces = new Workspaces(ref_container.current!)

    let prev_cell_ids = ''
    workspaces.on_changed = () => {
      const next_cell_ids = workspaces.cells.map(v => v.id).sort().join()
      if (prev_cell_ids === next_cell_ids) return;
      prev_cell_ids = next_cell_ids;

      let dragging: HTMLElement | null = null;
      let dropping: HTMLElement | null = null;
      set_views(
        workspaces.cells.map(cell => {
          const slot = workspaces.get_slot(cell);
          if (!slot) return null;
          const margin = 2;
          const size = `calc(100% - ${2*margin}px)`;
          return createPortal(
            <Frame
              style={{ width: size, height: size, margin }}
              draggable
              label={slot.id}
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
                  const dragging_slot = workspaces.get_slot(dragging)
                  const dropping_slot = workspaces.get_slot(dropping)
                  console.log(dragging_slot, dropping_slot)
                }
                e.preventDefault();
              }}
            >
              <Button onClick={() => workspaces.add(slot.id, 'left')}><ArrowLeft3 /></Button>
              <Button onClick={() => workspaces.add(slot.id, 'right')}><ArrowRight3 /></Button>
              <Button onClick={() => workspaces.add(slot.id, 'up')}><ArrowUp3 /></Button>
              <Button onClick={() => workspaces.add(slot.id, 'down')}><ArrowDown3 /></Button>
            </Frame>,
            cell,
            cell.id
          )
        })
      )
    }
    workspaces.update()
  }, [])

  return <>
    <div ref={ref_container} style={{ width: '100vw', height: '100vh' }} />
    {views}
  </>
}