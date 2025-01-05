import Show from "../Show";
import styles from "./styles.module.scss";

export interface ITreeNode<D = any> {
  path: string;
  name: string;
  children?: ITreeNode<D>[];
  data?: D;
}
export interface ITreeNodeGetIcon<D> {
  (data: { node: ITreeNode<D>, depth: number, open: boolean }): React.ReactNode
}
export interface ITreeNodeOnClick<D> {
  (node: ITreeNode<D>, e: React.MouseEvent<HTMLDivElement, MouseEvent>): void;
}
export interface ITreeNodeViewProps<D = any> extends React.HTMLAttributes<HTMLDivElement> {
  node?: ITreeNode<D>;
  depth?: number;
  opens?: string[];
  on_click_item?: ITreeNodeOnClick<D>;
  get_icon?: ITreeNodeGetIcon<D>;
}
export const file_suffix_emoji_map: { [x in string]?: React.ReactNode } = {
  zip: '📦',
  mp3: '🎼',
  png: '🖼️',
  webp: '🖼️',
}
export function default_get_icon(data: { node: ITreeNode<any>, depth: number, open: boolean }): React.ReactNode {
  const { node, open: is_open } = data;
  if (node.children) return is_open ? '📂' : '📁'
  const { name } = node;
  const lio = name.lastIndexOf('.');
  if (lio < 0) return '📄'
  const suffix = name.substring(+ 1).toLowerCase()
  return file_suffix_emoji_map[suffix] || '📄'
}
export function TreeNodeView<D = any>(props: ITreeNodeViewProps<D>) {
  const {
    node,
    depth = 0,
    opens,

    on_click_item,
    className,
    get_icon,
    ...remains
  } = props;
  if (!node) return <></>
  const open = opens?.find(v => v === node?.path) !== void 0;
  const icon = get_icon?.({ node, depth, open }) ?? default_get_icon({ node, depth, open })
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
      <Show show={open}>
        <div
          className={styles.tree_item_col_line}
          style={line_style} />
        {node.children?.map(node => (
          <TreeNodeView
            opens={opens}
            get_icon={get_icon}
            key={node.path}
            node={node}
            on_click_item={on_click_item}
            depth={depth + 1} />
        ))}
      </Show>
    </div>
  )
}
