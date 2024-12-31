import { useEffect, useRef, useState } from "react";
import { Button } from "../Component/Button";
import { TextArea } from "../Component/TextArea";
import { EntityEnum } from "../LF2/defines/EntityEnum";
import { IEntityData } from "../LF2/defines/IEntityData";
import Ditto, { IZip } from "../LF2/ditto";
import LF2 from "../LF2/LF2";
import open_file from "../Utils/open_file";
import { EntityEditorView } from "./EntityEditorView";
import styles from "./styles.module.css";
import { ITreeNode, TreeNodeView } from "./TreeNodeView";
import { shared_ctx } from './Context';
export interface IEditorViewProps extends React.HTMLAttributes<HTMLDivElement> {
  onClose?: (e: React.MouseEvent<HTMLButtonElement>) => void;
  loading?: boolean;
  open?: boolean;
  lf2?: LF2;
}
export default function EditorView(props: IEditorViewProps) {
  const { onClose, loading, open, lf2 } = props;
  const _ref_textarea_dat = useRef<HTMLTextAreaElement>(null);
  const _ref_textarea_json = useRef<HTMLTextAreaElement>(null);
  const [zip, set_zip] = useState<IZip>();
  const [opens, set_opens] = useState<string[]>()
  const [tree, set_tree] = useState<ITreeNode>();

  const [entity_editor_view, set_entity_editor_view] = useState<React.ReactNode>();
  const [textarea, set_textarea] = useState<React.ReactNode>();
  useEffect(() => console.log(entity_editor_view), [entity_editor_view])
  const on_click_read_zip = async () => {
    const [file] = await open_file({ accept: ".zip" });
    const zip = await Ditto.Zip.read_file(file);
    const root: ITreeNode = { name: file.name, path: '' }
    for (const key in zip.files) {
      let node = root;
      const parts = key.split('/');
      const j = await zip.file(key)?.json().catch(v => void 0);
      for (let part_idx = 0; part_idx < parts.length; part_idx++) {
        const part = parts[part_idx];
        const children = node.children = node.children || []
        const idx = children.findIndex(v => v.name === part)
        if (idx >= 0) node = children[idx];
        else children.push(node = {
          name: part,
          path: parts.slice(0, part_idx + 1).join('/'),
          lf2_type: j?.type
        })
      }
    }
    set_zip(zip);
    set_opens(['#'])
    set_tree(root);
  };

  const on_click_item = (node: ITreeNode) => {
    if (node.children) {
      set_opens((old = []) => {
        const ret = old.filter(v => v !== node.path)
        if (ret.length === old.length)
          ret.push(node.path)
        return ret.length ? ret : void 0;
      })
    } else if (node.lf2_type) {
      switch (node.lf2_type) {
        case EntityEnum.Character:
        case EntityEnum.Weapon:
        case EntityEnum.Ball:
        case EntityEnum.Entity:
          zip?.file(node.path)?.json().then(r => {
            console.log(r)
            set_entity_editor_view(<EntityEditorView data={r as IEntityData} />)
          });
          break;
        default: {
          zip?.file(node.path)?.text().then(r => {
            set_textarea(
              <TextArea ref={_ref_textarea_json} wrap="off" defaultValue={r} />
            )
          });
        }
      }
    }
  }
  return !open ? <></> : (
    <shared_ctx.Provider value={{ zip }}>
      <div className="editor_view">
        <div className="top">
          <Button onClick={onClose} disabled={loading}>
            ✕
          </Button>
          <Button
            onClick={() => on_click_read_zip().catch(console.warn)}
            disabled={loading}>
            打开
          </Button>
        </div>
        <div>
        </div>
        <div className="main" style={{ height: '100%', overflow: 'hidden' }}>
          <div className={`${styles.tree_item_view_wrapper} lf2_hoverable_border`}>
            <TreeNodeView
              node={tree}
              opens={opens}
              on_click_item={on_click_item}
              className={styles.tree_item_view_root} />
          </div>
          {textarea}
          {entity_editor_view}
        </div>
      </div>
    </shared_ctx.Provider>
  );
}
