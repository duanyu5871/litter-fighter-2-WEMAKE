import Show from "../Component/Show";
import { EntityEnum } from "../LF2/defines/EntityEnum";
import styles from "./styles.module.css";

export interface ITreeNode {
  path: string;
  name: string;
  children?: ITreeNode[];
  lf2_type?: string;
}

export interface ITreeNodeViewProps extends React.HTMLAttributes<HTMLDivElement> {
  node?: ITreeNode;
  depth?: number;
  opens?: string[];
  on_click_item?(node: ITreeNode, e: React.MouseEvent<HTMLDivElement, MouseEvent>): void;
}

export function TreeNodeView(props: ITreeNodeViewProps) {
  const { node, depth = 0, opens, on_click_item, className, ...remains } = props;
  if (!node) return <></>

  const lio = node.name.lastIndexOf('.')
  const suffix = node.name.substring(lio + 1).toLowerCase()

  const is_open = opens?.find(v => v === node.path) !== void 0;
  const icon = (node.children) ? (depth ? (is_open ? '📂' : '📁') : '📦') : {
    zip: '📦',
    mp3: '🎼',
    background: '🖼️',
    [EntityEnum.Ball]: '🥏',
    [EntityEnum.Weapon]: '🗡️',
    [EntityEnum.Character]: '🏃‍➡️',
    [EntityEnum.Entity]: '🌀',
  }[node.lf2_type || suffix] || '📄'

  const head_style = { paddingLeft: 12 * depth }
  const line_style = { left: 12 * depth + 8 }
  const root_classname = [className, styles.tree_item_view].filter(Boolean).join(' ');
  return (
    <div {...remains} className={root_classname}>
      <div
        className={styles.tree_item_head_view}
        style={head_style}
        title={node.path}
        onClick={(e) => on_click_item?.(node, e)}>
        <div className={styles.icon}>
          {icon}
        </div>
        {node.name}
      </div>
      <Show show={is_open}>
        <div
          className={styles.tree_item_col_line}
          style={line_style} />
        {node.children?.map(node => (
          <TreeNodeView
            opens={opens}
            key={node.path}
            node={node}
            on_click_item={on_click_item}
            depth={depth + 1} />
        ))}
      </Show>
    </div>
  )
}
