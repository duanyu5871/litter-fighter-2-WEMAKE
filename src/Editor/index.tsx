import { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Button } from "../Component/Buttons/Button";
import { Close3 } from "../Component/Icons/Clear";
import { new_id } from "../LF2/base";
import { IRect } from "../LF2/defines/IRect";
import styles from "./style.module.scss";
import { Slot, WorkspaceKeeper } from "./WorkspaceKeeper";
import EditorView from "../EditorView";

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
  return (
    <EditorView style={{ width: '100%', height: '100%', overflow: 'hidden', position: 'relative', padding: 5 }} open />
  )
  // const ref_slot_container = useRef<HTMLDivElement>(null);
  // const [views, set_views] = useState<React.ReactNode[]>([])
  // const [slot_changed_flag, set_slot_changed_flag] = useState(0)
  // const ref_workspace = useRef<WorkspaceKeeper>()
  // useEffect(() => {
  //   const container = ref_slot_container.current
  //   if (!container) return;
  //   const workspace = ref_workspace.current ?
  //     ref_workspace.current :
  //     ref_workspace.current = new WorkspaceKeeper(container)
  //   workspace.root_slot = root_slot
  //   workspace.on_changed = () => {
  //     set_views(
  //       workspace.cells.map(cell =>
  //         createPortal(
  //           <>
  //             <Button onClick={() => workspace.del_slot(cell.i_slot)}>
  //               <Close3 />
  //             </Button>
  //           </>,
  //           cell,
  //           cell.id
  //         )
  //       )
  //     )
  //   }
  //   workspace.update();
  //   const ob = new ResizeObserver(() => {
  //     workspace.update()
  //   })
  //   ob.observe(container)
  //   return () => ob.disconnect()
  // }, [slot_changed_flag])
  // return <>
  //   <div
  //     ref={ref_slot_container}
  //     tabIndex={-1}
  //   />
  //   {views}
  // </>

}