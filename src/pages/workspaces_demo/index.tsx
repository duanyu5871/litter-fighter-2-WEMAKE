import { useEffect, useMemo, useRef, useState } from "react"
import { Workspaces } from "../../Workspaces"
import Frame from "../../Component/Frame";
import { createPortal } from "react-dom";

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
      set_views(
        workspaces.cells.map(cell => {
          const slot = workspaces.get_slot(cell);
          if (!slot) return null;
          const margin = 5;
          const size = `calc(100% - ${2 * margin}px)`;
          return createPortal(
            <Frame style={{ width: size, height: size, margin }}>

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
    <div ref={ref_container} />
    {views}
  </>
}