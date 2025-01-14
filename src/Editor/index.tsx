import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Button } from "../Component/Buttons/Button";
import { ArrorUp3, Close3 } from "../Component/Icons/Clear";
import { new_id } from "../LF2/base";
import { Slot, WorkspaceKeeper } from "./WorkspaceKeeper";
import { ArrorDown3 } from "../Component/Icons/ArrorDown3";
import { ArrorLeft3 } from "../Component/Icons/ArrorLeft3";
import { ArrorRight3 } from "../Component/Icons/ArrorRight3";

function g_s(t: 'v' | 'h', ...c: Slot[]): Slot {
  const ret = new Slot({ id: 'cell_' + new_id(), t }, c)
  return ret
}
// const root_slot = g_s('h',
//   g_s('v',
//     g_s('v'),
//     g_s('v')
//   ),
//   g_s('v',
//     g_s('v'),
//     g_s('v'),
//     g_s('h',
//       g_s('v'),
//       g_s('v',
//         g_s('h'),
//         g_s('h')
//       )
//     )
//   ),
//   g_s('v',
//     g_s('v'),
//     g_s('v')
//   ),
// )
const root_slot = g_s('h',
  g_s('v'),
  g_s('v'),
  g_s('v'),
  g_s('v')
)
export default function Editor() {
  // return (
  //   <EditorView style={{ width: '100%', height: '100%', overflow: 'hidden', position: 'relative', padding: 5 }} open />
  // )
  const ref_slot_container = useRef<HTMLDivElement>(null);
  const [views, set_views] = useState<React.ReactNode[]>([])
  const [slot_changed_flag, set_slot_changed_flag] = useState(0)
  const ref_workspace = useRef<WorkspaceKeeper>()
  useEffect(() => {
    const container = ref_slot_container.current
    if (!container) return;
    const workspace = ref_workspace.current ?
      ref_workspace.current :
      ref_workspace.current = new WorkspaceKeeper(container)
    workspace.set_root(root_slot)
    workspace.on_changed = () => {
      console.log('on_changed')
      set_views(
        workspace.cells.map(cell =>
          createPortal(
            <div style={{ border: '1px red solid', width: '100%', height: '100%' }}>
              <Button onClick={() => workspace.del_slot(cell.i_slot)}>
                <Close3 />
              </Button>
              <Button onClick={() => workspace.add(cell.i_slot.id, 'up', { id: 'cell_' + new_id() })}>
                <ArrorUp3 />
              </Button>
              <Button onClick={() => workspace.add(cell.i_slot.id, 'down', { id: 'cell_' + new_id() })}>
                <ArrorDown3 />
              </Button>
              <Button onClick={() => workspace.add(cell.i_slot.id, 'left', { id: 'cell_' + new_id() })}>
                <ArrorLeft3 />
              </Button>
              <Button onClick={() => workspace.add(cell.i_slot.id, 'right', { id: 'cell_' + new_id() })}>
                <ArrorRight3 />
              </Button>
              <div>id: {cell.i_slot.id}</div>
              <div>t: {cell.i_slot.t}</div>
              <div>f: {cell.i_slot.f}</div>
            </div>,
            cell,
            cell.id
          )
        )
      )
    }
    workspace.update();
    const ob = new ResizeObserver(() => {
      workspace.update()
    })
    ob.observe(container)
    return () => ob.disconnect()
  }, [slot_changed_flag])
  return <>
    <div
      ref={ref_slot_container}
      tabIndex={-1}
    />
    {views}
  </>

}