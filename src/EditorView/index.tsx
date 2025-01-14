import { Board, FactoryEnum, Gaia, ToolEnum } from "@fimagine/writeboard";
import { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Button } from "../Component/Buttons/Button";
import { Checkbox } from "../Component/Checkbox";
import Combine from "../Component/Combine";
import Frame from "../Component/Frame";
import { Add } from "../Component/Icons/Clear";
import Select from "../Component/Select";
import Show from "../Component/Show";
import { Space } from "../Component/Space";
import { TabButtons } from "../Component/TabButtons";
import Titled from "../Component/Titled";
import { ITreeNode, ITreeNodeGetIcon, TreeView } from "../Component/TreeView";
import { IBgData, IFrameInfo } from "../LF2/defines";
import { EntityEnum } from "../LF2/defines/EntityEnum";
import { IEntityData } from "../LF2/defines/IEntityData";
import Ditto, { IZip } from "../LF2/ditto";
import { ILf2Callback } from "../LF2/ILf2Callback";
import LF2 from "../LF2/LF2";
import { traversal } from "../LF2/utils/container_help/traversal";
import { is_num } from "../LF2/utils/type_check";
import open_file from "../Utils/open_file";
import { Slot } from "../Workspaces/Slot";
import { Workspaces } from "../Workspaces/Workspaces";
import { shared_ctx } from './Context';
import { EditorShapeEnum } from "./EditorShapeEnum";
import { EntityDataEditorView } from "./EntityDataEditorView";
import { EntityBaseDataEditorView } from "./EntityDataEditorView/EntityBaseDataEditorView";
import { FrameDrawer, FrameDrawerData } from "./FrameDrawer";
import { FrameEditorView } from "./FrameEditorView";
import { ItrPrefabEditorView } from "./FrameEditorView/ItrPrefabEditorView";
import { PicInfoEditorView } from "./PicInfoEditorView";
import styles from "./styles.module.scss";
import { WorkspaceColumnView } from "./WorkspaceColumnView";

enum EntityEditing {
  base = '基础信息',
  frame_index = '特定帧',
  frames = '帧列表',
  pic = '图片',
  itr_pre = 'itr预设',
  bdy_pre = 'bdy预设',
}
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
type TTreeNode = ITreeNode<IEntityData | IBgData | null>

const dat_type_emoji_map: { [x in string]?: React.ReactNode } = {
  [EntityEnum.Ball]: '🥏',
  [EntityEnum.Weapon]: '🗡️',
  [EntityEnum.Character]: '🏃‍➡️',
  [EntityEnum.Entity]: '🌀',
  'background': '⛰️'
}
const get_icon: ITreeNodeGetIcon<IEntityData | IBgData | null> = ({ node, depth }) => {
  if (depth === 0) return '📦';
  if (!node.data) return void 0;
  const type = node.data.type;
  return dat_type_emoji_map[type]
}
export interface IFramesEditorViewProps {
  data?: IEntityData;
  zip?: IZip;
  ref_board: React.RefObject<Board | undefined>
}
export function FramesEditorView(props: IFramesEditorViewProps) {
  const { data, zip, ref_board } = props;

  const [editing_frame, set_frame] = useState<IFrameInfo>()
  const ref_next_frame = useRef<IFrameInfo>()
  if (!data) return void 0;
  const on_frame_change = (frame: IFrameInfo, data: IEntityData) => {
    set_frame(frame)
    const board = ref_board.current!;
    const shape_data = factory.newShapeData(EditorShapeEnum.LF2_FRAME) as FrameDrawerData;
    shape_data.frame = frame;
    shape_data.zip = zip;
    shape_data.data = data;
    shape_data.layer = board.layer().id;
    shape_data.id = 'frame';
    shape_data.z = factory.newZ(shape_data);
    const { w, h } = FrameDrawer.get_size(frame);
    Object.assign(shape_data, { w: w * 2, h: h * 2 })
    let shape = board.shapes().find(v => v.data.id === 'frame') as FrameDrawer | undefined;
    if (!shape) {
      shape = factory.newShape(shape_data) as FrameDrawer;
      board.add(shape);
    } else {
      let { x, y } = shape;
      if (shape.data.frame) {
        const a = FrameDrawer.get_bounding(shape.data.frame)
        const b = FrameDrawer.get_bounding(shape_data.frame)
        console.log(a.l, b.l)
        x += (b.l - a.l + shape.data.frame.centerx - shape_data.frame.centerx) * 2
        y += (b.t - a.t + shape.data.frame.centery - shape_data.frame.centery) * 2
      }
      shape_data.x = x
      shape_data.y = y
      shape.merge(shape_data)
      board.setSelects([shape])
    }
  }
  const frame_views: React.ReactNode[] = [];
  const frames: IFrameInfo[] = []
  for (const key in data.frames) {
    const frame = data.frames[key];
    frames.push(frame)
    const node = (
      <Space.Item
        key={frames.length}
        tabIndex={-1}
        onKeyUp={e => {
          switch (e.key.toLowerCase()) {
            case 'arrowdown':
            case 'pagedown':
            case 'arrowup':
            case 'pageup': {
              const next_frame = ref_next_frame.current;
              if (next_frame) {
                set_frame(next_frame)
                on_frame_change(next_frame, data)
                ref_next_frame.current = void 0;
              }
              break;
            }
          }
        }}
        onKeyDown={e => {
          e.stopPropagation();
          e.preventDefault();

          switch (e.key.toLowerCase()) {
            case 'enter': {
              on_frame_change(frame, data)
              return;
            }
          }
          const ele = (e.target as HTMLElement);
          const scroll_view = (ele.parentElement as HTMLElement | null)
          if (!scroll_view) return;
          const ele_collection = scroll_view.children;
          const next_ele = ((ele.nextElementSibling ?? ele_collection.item(0)) as HTMLElement | null)
          const prev_ele = ((ele.previousElementSibling ?? ele_collection.item(ele_collection.length - 1)) as HTMLElement | null)
          const pt = parseInt(getComputedStyle(scroll_view).paddingTop)
          switch (e.key.toLowerCase()) {
            case 'arrowdown':
            case 'pagedown': {
              if (!next_ele) break;
              scroll_view.scrollTo(0, next_ele.offsetTop - pt)
              next_ele.focus()
              const idx = (frames.indexOf(frame) + 1) % frames.length
              ref_next_frame.current = frames[idx]
              break;
            }
            case 'arrowup':
            case 'pageup': {
              if (!prev_ele) break;
              scroll_view.scrollTo(0, prev_ele.offsetTop - pt)
              prev_ele.focus()
              const idx = (frames.indexOf(frame) + frames.length - 1) % frames.length
              ref_next_frame.current = frames[idx]
              break;
            }
          }
        }}>
        <FrameEditorView
          key={frame.id}
          value={frame}
          data={data}
          active={editing_frame === frame}
          onClick={() => on_frame_change(frame, data)}
        />
      </Space.Item>
    )
    frame_views.push(node);
  }
  const header = <WorkspaceColumnView.TitleAndAdd title="帧列表" />
  return (
    <Space.Broken>
      <WorkspaceColumnView header={header}>
        <Space.Item space vertical frame className={styles.file_editor_view}>
          {frame_views}
        </Space.Item>
      </WorkspaceColumnView>
    </Space.Broken>
  )
}
export default function EditorView(props: IEditorViewProps) {
  const ref_board = useRef<Board>();
  const [board_wrapper, set_board_wrapper] = useState<HTMLDivElement>()
  const { onClose, loading, open, lf2, ..._p } = props;
  const [zip_name, set_zip_name] = useState('');
  const [zips, set_zips] = useState<IZip[]>();
  const [zip, set_zip] = useState<IZip>();

  useEffect(() => {
    if (!lf2) return;
    const cb: ILf2Callback = {
      on_zips_changed: (zips) => set_zips(zips)
    }
    lf2.callbacks.add(cb);
    return () => lf2.callbacks.del(cb);

  }, [lf2])

  const [opens, set_opens] = useState<string[]>()
  const [tree, set_tree] = useState<TTreeNode>();
  const [textarea, set_textarea] = useState<React.ReactNode>();
  const ref_editing_node = useRef<TTreeNode>()
  const ref_editing_data = useRef<IEntityData>()
  const [editing_node, set_editing_node] = useState<TTreeNode>();
  const [editing_data, set_editing_data] = useState<IEntityData>();
  const [tab, set_tab] = useState<EntityEditing | undefined>(EntityEditing.base);
  ref_editing_node.current = editing_node;
  ref_editing_data.current = editing_data;

  const frame_list_view = useMemo(() => {
    return (
      <FramesEditorView
        data={editing_data}
        zip={zip}
        ref_board={ref_board}
      />
    )
  }, [editing_data, zip])

  const [state, set_state] = useState({
    mp3: false,
    flat: true,
    json: true,
    img: false,
    others: true
  })
  const filters_tree = useMemo(() => {
    const handle_tree_node = (src: TTreeNode): TTreeNode | undefined => {
      if (!src.children) {
        if (src.key.endsWith('.mp3')) {
          if (!state.mp3) return;
        } else if (src.key.endsWith('.json')) {
          if (!state.json) return;
        } else if (src.key.endsWith('.png')) {
          if (!state.img) return;
        } else if (src.key.endsWith('.webp')) {
          if (!state.img) return;
        } else if (!state.others) {
          return;
        }
      }
      const ret: TTreeNode = { ...src }
      if (!src.children) return ret;
      const children: TTreeNode[] = ret.children = []
      for (const child of src.children) {
        const o = handle_tree_node(child)
        if (o) children.push(o)
      }
      return ret;
    }

    const ret = tree ? handle_tree_node(tree) : void 0;
    if (ret && state.flat) {
      const children: TTreeNode[] = []
      const flat = (i: TTreeNode) => {
        if (!i.children) return;
        for (const child of i.children) {
          if (!child.children) children.push({ ...child, label: '' + child.title });
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
    set_zip(zip);
    set_zip_name(file.name)
  };

  const load_zip = async (name: string, zip: IZip) => {
    const root: TTreeNode = { key: '', label: name, title: '' };
    for (const key in zip.files) {
      let node = root;
      const parts = key.split('/');
      const j = await zip.file(key)?.json().catch(v => void 0);
      for (let part_idx = 0; part_idx < parts.length; part_idx++) {
        const part = parts[part_idx];
        const children = node.children = node.children || [];
        const idx = children.findIndex(v => v.label === part);
        if (idx >= 0) node = children[idx];
        else children.push(node = {
          key: parts.slice(0, part_idx + 1).join('/'),
          label: part,
          title: parts.slice(0, part_idx + 1).join('/'),
          data: j
        });
      }
    }
    set_opens([root.key]);
    set_tree(root);
  }

  useEffect(() => {
    if (zip) load_zip(zip_name, zip)
  }, [zip_name, zip])

  const on_click_item = (node: TTreeNode) => {
    if (node.children) {
      set_opens((old = []) => {
        const ret = old.filter(v => v !== node.key)
        if (ret.length === old.length)
          ret.push(node.key)
        return ret.length ? ret : void 0;
      })
    } else if (node.data?.type) {
      switch (node.data?.type) {
        case EntityEnum.Character:
        case EntityEnum.Weapon:
        case EntityEnum.Ball:
        case EntityEnum.Entity:
          zip?.file(node.key)?.json().then(r => {
            const editing_node = ref_editing_node.current;
            const editing_data = ref_editing_data.current;
            if (zip && editing_node && editing_data) {
              zip.set(editing_node.key, JSON.stringify(editing_data))
            }
            set_editing_node(node)
            set_editing_data(r)
          });
          break;
        default: {
          zip?.file(node.key)?.text().then(r => {
            const editing_node = ref_editing_node.current;
            const editing_data = ref_editing_data.current;
            if (zip && editing_node && editing_data) {
              zip.set(editing_node.key, JSON.stringify(editing_data))
            }
            set_editing_node(node)
            set_editing_data(void 0)
          });
        }
      }
    } else if (node.key.endsWith('.txt') || node.key.endsWith('.json')) {
      zip?.file(node.key)?.text().then(r => {
        const editing_node = ref_editing_node.current;
        const editing_data = ref_editing_data.current;
        if (zip && editing_node && editing_data) {
          zip.set(editing_node.key, JSON.stringify(editing_data))
        }
        set_editing_node(node)
        set_editing_data(void 0)
      });
    }
  }
  useEffect(() => {
    const container = board_wrapper;
    if (!container || !open) return;
    const board = ref_board.current = factory.newWhiteBoard({ element: container });
    board.setToolType(ToolEnum.Selector);
    (window as any).board = board;
    const ob = new ResizeObserver(() => {
      const { width, height } = container.getBoundingClientRect();
      board.width = width;
      board.height = height;
      board.markDirty({ x: 0, y: 0, w: width, h: height })
    })
    ob.observe(container)
    return () => {
      board.layer().destory();
      ob.disconnect();
    }
  }, [open, board_wrapper])

  const [change_flag, set_change_flag] = useState(0)
  // const files = editing_data?.base.files;

  const base_data_view = useMemo(() => {
    if (!editing_data) return;

    return (
      <Space.Broken>
        <EntityBaseDataEditorView
          value={editing_data}
          on_changed={() => set_change_flag(change_flag + 1)}
          style={{ flex: 1, overflow: 'auto', flexFlow: 'column' }}
        />
      </Space.Broken>
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editing_data, change_flag])

  const pic_list_view = useMemo(() => {
    if (!editing_data) return;
    const views: React.ReactNode[] = []
    if (editing_data.base.files) traversal(editing_data.base.files, (k, v) => {
      views.push(
        <PicInfoEditorView
          pic_info={v}
          data={editing_data}
          key={'FileEditorView_' + k}
          on_changed={() => set_change_flag(change_flag + 1)}
        />
      )
    })

    const add = () => {
      let i = Object.keys(editing_data.base.files).length;
      while (('' + i) in editing_data.base.files) ++i;
      editing_data.base.files['' + i] = {
        row: 0,
        col: 0,
        id: '' + i,
        path: '',
        cell_w: 0,
        cell_h: 0,
      }
      set_change_flag(change_flag + 1);
    }
    const header = <WorkspaceColumnView.TitleAndAdd title="实体图片" on_add={add} />
    return (
      <Space.Broken>
        <WorkspaceColumnView header={header}>
          <Space.Item space vertical frame className={styles.file_editor_view}>
            {views}
          </Space.Item>
        </WorkspaceColumnView>
      </Space.Broken>
    )
  }, [editing_data, change_flag])

  const itr_prefabs = editing_data?.itr_prefabs;
  const itr_prefab_list_view = useMemo(() => {
    if (!editing_data) return void 0;
    const views: React.ReactNode[] = []
    if (itr_prefabs) traversal(itr_prefabs, (k, value) => {
      if (!value) return;
      const label = `itr_prefabs: ${k}`
      views.push(
        <ItrPrefabEditorView
          label={label}
          value={value}
          data={editing_data}
          key={label}
          on_changed={() => set_change_flag(change_flag + 1)} />
      )
    })
    const add = () => {
      if (itr_prefabs) {
        let i = Object.keys(itr_prefabs).length;
        while (('' + i) in itr_prefabs) ++i;
        itr_prefabs['' + i] = { id: '' + i }
      } else {
        editing_data.itr_prefabs = {};
        editing_data.itr_prefabs['0'] = { id: '0' }
      }
      set_change_flag(change_flag + 1);
    }

    return (
      <Space.Broken>
        <Combine
          direction='column'
          className={styles.header_main_footer_view}
          hoverable={false}>
          <Combine direction='row' hoverable={false}>
            <div style={{ flex: 1, textAlign: 'center' }}>
              ITR预设
            </div>
            <Button key={views.length} onClick={add}>
              <Add />
            </Button>
          </Combine>
          <div className={styles.content_zone}>
            <Space vertical className={styles.file_editor_view}>
              {views}
            </Space>
          </div>
        </Combine>
      </Space.Broken>
    );
  }, [itr_prefabs, editing_data, change_flag])


  const ref_wprkspace_container = useRef<HTMLDivElement>(null);
  const [slot_changed_flag, set_slot_changed_flag] = useState(0)
  const ref_workspace = useRef<Workspaces>()
  const [cells, set_cells] = useState<Readonly<HTMLElement[]>>([])

  const views = useMemo(() => {
    return (
      cells.map(cell => {
        switch (cell.id) {
          case 'resources_cell':
            return createPortal(
              <WorkspaceColumnView
                className={styles.cell_inner}
                header={
                  <WorkspaceColumnView.TitleAndAdd title={
                    <Space>
                      <Titled label="mp3"><Checkbox value={state.mp3} onChanged={v => set_state(o => ({ ...o, mp3: v }))} /></Titled>
                      <Titled label="flat"><Checkbox value={state.flat} onChanged={v => set_state(o => ({ ...o, flat: v }))} /></Titled>
                      <Titled label="json"><Checkbox value={state.json} onChanged={v => set_state(o => ({ ...o, json: v }))} /></Titled>
                      <Titled label="img"><Checkbox value={state.img} onChanged={v => set_state(o => ({ ...o, img: v }))} /></Titled>
                      <Titled label="others"><Checkbox value={state.others} onChanged={v => set_state(o => ({ ...o, others: v }))} /></Titled>
                    </Space>
                  }>
                  </WorkspaceColumnView.TitleAndAdd>
                }>
                <Space.Item space vertical frame className={styles.file_editor_view}>
                  <TreeView
                    node={filters_tree}
                    opens={opens}
                    on_click_item={on_click_item}
                    get_icon={get_icon}
                  />
                </Space.Item>
              </WorkspaceColumnView>,
              cell,
              cell.id
            )
          case 'data_cell':
            return createPortal(
              <div
                className={styles.cell_inner}
                style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
                <EntityDataEditorView
                  value={editing_data}
                  on_changed={() => set_change_flag(change_flag + 1)}
                  className={styles.entity_base_editor} />
                <Space.Item style={{ display: 'flex' }}>
                  <TabButtons
                    value={tab}
                    items={Object.values(EntityEditing)}
                    parse={v => [v, v]}
                    onChange={v => set_tab(v)}
                    style={{ flex: 1 }}
                    styles={{ button: { flex: 1 } }} />
                </Space.Item>
                <Space.Broken>
                  {tab === EntityEditing.base ? base_data_view : null}
                  {tab === EntityEditing.frames ? frame_list_view : null}
                  {tab === EntityEditing.pic ? pic_list_view : null}
                  {tab === EntityEditing.itr_pre ? itr_prefab_list_view : null}
                </Space.Broken>
              </div>,
              cell,
              cell.id
            )
          case 'preview_cell':
            return createPortal(
              <Frame
                ref={(r) => set_board_wrapper(prev => r || prev)}
                className={styles.cell_inner}
                style={{ background: 'transparent' }} />,
              cell,
              cell.id
            )
        }
        return null
      })
    )
  }, [cells, filters_tree, on_click_item, opens, state.flat, state.img, state.json, state.mp3, state.others])

  useEffect(() => {
    const container = ref_wprkspace_container.current
    if (!container) return;
    const workspace = ref_workspace.current ?
      ref_workspace.current :
      ref_workspace.current = new Workspaces(container)
    if (!workspace.root) {
      workspace.set_root(
        new Slot({ id: 'root', t: 'h' }, [
          new Slot({ id: 'resources_cell', t: 'v', f: 250 }),
          new Slot({ id: 'data_cell', t: 'v', f: 250 }),
          new Slot({ id: 'preview_cell', t: 'v', f: container.offsetWidth - 500 }),
        ])
      )
    }
    workspace.on_changed = () => set_cells(workspace.cells)
    workspace.update();
    const ob = new ResizeObserver(() => {
      workspace.update()
    })
    ob.observe(container)
    return () => ob.disconnect()
  }, [])

  return !open ? <></> : (
    <shared_ctx.Provider value={{ zip }}>
      {views}
      <Space direction='column' {..._p} >
        <Space onClick={e => { e.stopPropagation(); e.preventDefault() }}>
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
          <Show show={!!zips?.length}>
            <Select
              items={zips}
              parse={i => [zips?.indexOf(i), i.name]}
              value={zip ? zips?.indexOf(zip) : void 0}
              on_changed={(i) => {
                set_zip(is_num(i) ? zips?.at(i) : void 0)
              }} />
          </Show>
        </Space>
        <Space.Item style={{ alignSelf: 'stretch', flex: 1, minHeight: '0px', position: 'relative' }}>
          <div ref={ref_wprkspace_container} />
        </Space.Item>
      </Space>
    </shared_ctx.Provider>
  );
}
