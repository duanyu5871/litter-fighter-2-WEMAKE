import { Key, ReactNode, useEffect, useMemo, useState } from "react";
import ReactDOM from "react-dom";
import { DomAdapter } from "splittings-dom/dist/es/splittings-dom";
import { Slot, Workspaces } from "splittings/dist/es/splittings";
import "splittings-dom/dist/es/splittings-dom.css";

export interface IUseWorkspacesOpts {
  container: HTMLElement | null;
  render?: (slot: Slot, el: HTMLElement, idx: number) => ReactNode;
  key?: (slot: Slot, el: HTMLElement, idx: number) => Key
}
export function useWorkspaces(opts: IUseWorkspacesOpts) {
  const { render, key, container } = opts;

  const [_container, set_container] = useState<HTMLElement | null>(container)
  const [pairs, set_pairs] = useState<[Slot, HTMLElement][]>([])
  const [workspace, set_workspace] = useState<Workspaces | null>(null)
  useEffect(() => {
    if (!_container) return;
    const adpater = new DomAdapter(_container)
    const workspace = new Workspaces(adpater)
    workspace.on_leaves_changed = () => {
      const pairs: [Slot, HTMLElement][] = []
      for (const leaf of workspace.leaves) {
        const cell = adpater.get_cell(leaf)
        if (!cell || cell.children.length) continue;
        if (!cell.parentElement) workspace.adapter.container.appendChild(cell);
        pairs.push([leaf, cell]);
      }
      set_pairs(pairs)
    }
    workspace.confirm()
    set_workspace(workspace);
    return () => {
      workspace.on_leaves_changed = void 0
      workspace.root.release()
      workspace.release()
    }
  }, [_container])

  const context = useMemo(() => {
    if (!render) return <></>
    return (
      <>
        {pairs.map(([slot, el], idx) => ReactDOM.createPortal(render(slot, el, idx), el, key ? key(slot, el, idx) : idx))}
      </>
    )
  }, [pairs, render, key])

  return { workspace, set_container, pairs, context };
}
