import { useEffect, useMemo, useRef, useState } from "react";
import { Button } from "../Component/Buttons/Button";
import { TextArea } from "../Component/TextArea";
import { EntityEnum } from "../LF2/defines/EntityEnum";
import { IEntityData } from "../LF2/defines/IEntityData";
import Ditto, { IZip } from "../LF2/ditto";
import LF2 from "../LF2/LF2";
import open_file from "../Utils/open_file";
import { shared_ctx } from './Context';
import { EntityEditorView } from "./EntityEditorView";
import styles from "./styles.module.css";
import { ITreeNode, TreeNodeView } from "./TreeNodeView";
import { Checkbox } from "../Component/Checkbox";
import Titled from "../Component/Titled";
import { Space } from "../Component/Space";
import Show from "../Component/Show";
import { FactoryEnum, Gaia, ShapeEnum, ToolEnum, Board } from "@fimagine/writeboard";
import { FrameDrawer, FrameDrawerData } from "./FrameDrawer";
import { EditorShapeEnum } from "./EditorShapeEnum";
import { IFrameInfo } from "../LF2/defines";

Gaia.registerShape(
  EditorShapeEnum.LF2_FRAME,
  () => new FrameDrawerData(),
  (d) => new FrameDrawer(d),
  { desc: 'lf2 frame drawer' }
)
const factory = Gaia.factory(FactoryEnum.Default)();

export interface IEditorViewProps extends React.HTMLAttributes<HTMLDivElement> {
  onClose?: (e: React.MouseEvent<HTMLButtonElement>) => void;
  loading?: boolean;
  open?: boolean;
  lf2?: LF2;
}
export default function EditorView(props: IEditorViewProps) {
  const ref_div = useRef<HTMLDivElement>(null);
  const ref_board = useRef<Board>()
  const { onClose, loading, open, lf2, ..._p } = props;
  const _ref_textarea_dat = useRef<HTMLTextAreaElement>(null);
  const _ref_textarea_json = useRef<HTMLTextAreaElement>(null);
  const [zip, set_zip] = useState<IZip>();
  const [opens, set_opens] = useState<string[]>()
  const [tree, set_tree] = useState<ITreeNode>();

  const [entity_editor_view, set_entity_editor_view] = useState<React.ReactNode>();
  const [textarea, set_textarea] = useState<React.ReactNode>();

  const [state, set_state] = useState({
    mp3: false,
    flat: true,
    json: true,
    img: false,
    others: true
  })
  const filters_tree = useMemo(() => {
    const handle_tree_node = (src: ITreeNode): ITreeNode | undefined => {
      if (!src.children) {
        if (src.name.endsWith('.mp3')) {
          if (!state.mp3) return;
        } else if (src.name.endsWith('.json')) {
          if (!state.json) return;
        } else if (src.name.endsWith('.png')) {
          if (!state.img) return;
        } else if (src.name.endsWith('.webp')) {
          if (!state.img) return;
        } else if (!state.others) {
          return;
        }
      }
      const ret: ITreeNode = { ...src }
      if (!src.children) return ret;
      const children: ITreeNode[] = ret.children = []
      for (const child of src.children) {
        const o = handle_tree_node(child)
        if (o) children.push(o)
      }
      return ret;
    }

    const ret = tree ? handle_tree_node(tree) : void 0;
    if (ret && state.flat) {
      const children: ITreeNode[] = []
      const flat = (i: ITreeNode) => {
        if (!i.children) return;
        for (const child of i.children) {
          if (!child.children) children.push({ ...child, name: child.path });
          else flat(child)
        }
      }
      flat(ret)
      ret.children = children;
    }
    return ret
  }, [tree, state])

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
    set_opens([root.path])
    set_tree(root);
  };

  const on_click_frame = (frame: IFrameInfo, data: IEntityData) => {
    const board = ref_board.current!;
    const shape_data = factory.newShapeData(EditorShapeEnum.LF2_FRAME) as FrameDrawerData;
    shape_data.frame = frame;
    shape_data.zip = zip;
    shape_data.data = data;
    shape_data.layer = board.layer().id;
    shape_data.id = 'frame';
    shape_data.z = factory.newZ(shape_data);
    let shape = board.shapes().find(v => v.data.id === 'frame') as FrameDrawer | undefined;
    if (!shape) {
      shape = factory.newShape(shape_data) as FrameDrawer;
      Object.assign(shape.data, shape.get_size())
      board.add(shape);
    } else {
      const { x, y } = shape;
      shape.merge(shape_data)
      shape.beginDirty();
      Object.assign(shape.data, shape.get_size(), { x, y })
      shape.endDirty();
    }
  }
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
            const data = r as IEntityData;
            set_entity_editor_view(
              <EntityEditorView
                key={node.path + '_eev'}
                src={data}
                on_click_frame={on_click_frame}
              />
            )
            on_click_frame(data.frames['0'], data);
          });
          break;
        default: {
          zip?.file(node.path)?.text().then(r => {
            set_entity_editor_view(void 0)
            // set_textarea(<TextArea ref={_ref_textarea_json} key={node.path + '_txt'} wrap="off" defaultValue={r} />)
          });
        }
      }
    } else if (node.name.endsWith('.txt') || node.name.endsWith('.json')) {
      zip?.file(node.path)?.text().then(r => {
        // set_entity_editor_view(void 0)
        // set_textarea(<TextArea ref={_ref_textarea_json} key={node.path + '_txt'} wrap="off" defaultValue={r} />)
      });
    }
  }

  useEffect(() => {
    const container = ref_div.current;
    if (!container) return;

    const board = ref_board.current = factory.newWhiteBoard({ element: container });

    board.setToolType(ToolEnum.Selector);
    (window as any).board = board;

    const ob = new ResizeObserver(() => {
      const { width, height } = container.getBoundingClientRect();
      board.width = width;
      board.height = height;
    })
    ob.observe(container)

    return () => {
      board.layer().destory();
      ob.disconnect();
    }

  }, [])

  return !open ? <></> : (
    <shared_ctx.Provider value={{ zip }}>
      <Space direction='column' {..._p} >
        <Space>
          <Show show={!!onClose}>
            <Button onClick={onClose} disabled={loading}>
              ✕
            </Button>
          </Show>
          <Button
            onClick={() => on_click_read_zip().catch(console.warn)}
            disabled={loading}>
            打开
          </Button>
        </Space>
        <Space.Item style={{ flex: 1 }}>
          <Space style={{ width: '100%', height: '100%' }}>
            <Space.Item className={`${styles.tree_item_view_wrapper} lf2_hoverable_border`}
              space
              style={{ display: 'flex', flexDirection: 'column', flexFlow: 'column' }}>
              <Space>
                <Titled title="mp3"><Checkbox value={state.mp3} onChanged={v => set_state(o => ({ ...o, mp3: v }))} /></Titled>
                <Titled title="flat"><Checkbox value={state.flat} onChanged={v => set_state(o => ({ ...o, flat: v }))} /></Titled>
                <Titled title="json"><Checkbox value={state.json} onChanged={v => set_state(o => ({ ...o, json: v }))} /></Titled>
                <Titled title="img"><Checkbox value={state.img} onChanged={v => set_state(o => ({ ...o, img: v }))} /></Titled>
                <Titled title="others"><Checkbox value={state.others} onChanged={v => set_state(o => ({ ...o, others: v }))} /></Titled>
              </Space>
              <Space.Item style={{
                flexGrow: 1,
                flexShrink: 0,
                flexBasis: 0,
                overflow: 'auto'
              }}>
                <TreeNodeView
                  node={filters_tree}
                  opens={opens}
                  on_click_item={on_click_item}
                />
              </Space.Item>

            </Space.Item>
            {entity_editor_view}
            {textarea}
            <Space.Item
              space className='lf2_hoverable_border'
              style={{ position: 'relative', flex: 1 }}
              _ref={ref_div} />
          </Space>
        </Space.Item>
      </Space>
    </shared_ctx.Provider>
  );
}
