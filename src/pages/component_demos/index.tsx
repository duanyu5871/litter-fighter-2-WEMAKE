import { Outlet, useNavigate } from "react-router";
import { Space } from "../../Component/Space";
import { ITreeNode, TreeView } from "../../Component/TreeView";
import { Paths } from "../../Paths";
import styles from './styles.module.scss'
export const tree_root: ITreeNode[] = [
  { key: Paths.All.component_demos_InputNumber, label: 'InputNumber' },
  { key: Paths.All.component_demos_Button, label: 'Button' },
  { key: Paths.All.component_demos_Combine, label: 'Combine' },
  { key: Paths.All.component_demos_Select, label: 'Select' },
  { key: Paths.All.component_demos_Input, label: 'Input' },
  { key: Paths.All.component_demos_Icon, label: 'Icon' },
]
export default function ComponentDemo() {
  const nav = useNavigate();
  return (
    <Space className={styles.component_demo_root}>
      <Space.Item frame>
        <TreeView nodes={tree_root} show_icon={false} on_click_item={i => nav(i.key)} />
      </Space.Item>
      <Space.Item className={styles.right_zone}>
        <Outlet />
      </Space.Item>
    </Space>
  )
}