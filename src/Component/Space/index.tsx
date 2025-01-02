import { useMemo } from "react";
import './styles.scss'
export interface ISpaceProps extends React.HTMLAttributes<HTMLDivElement> {
  item_props?: React.HTMLAttributes<HTMLDivElement>
}
export function Space(props: ISpaceProps) {
  const { className, children, item_props, ..._p } = props;
  const root_cls_name = useMemo(() => ["lf2ui_space", className].filter(Boolean).join(' '), [className])

  const { className: i_cls_name, ...i_p } = item_props || {};
  const item_cls_name = useMemo(() => ["item", i_cls_name].filter(Boolean).join(' '), [i_cls_name])

  const items = Array.isArray(children) ? children : children ? [children] : void 0
  return (
    <div className={root_cls_name} {..._p}>
      {
        items?.map((v, i) => {
          switch (v) {
            case void 0: case null: case true: case false:
              return null
          }
          return <div className={item_cls_name} {...i_p} key={i}>{v}</div>
        })
      }
    </div>
  )
}