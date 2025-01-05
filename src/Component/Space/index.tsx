import React, { useMemo } from "react";
import Show, { Div } from "../Show";
import './styles.scss';
export interface ISpaceProps extends React.HTMLAttributes<HTMLDivElement> {
  item_props?: React.HTMLAttributes<HTMLDivElement>;
  direction?: 'column' | 'row';
  vertical?: boolean;
  _ref?: React.RefObject<HTMLDivElement>;
}
export function Space(props: ISpaceProps) {
  const {
    className,
    children,
    item_props,
    vertical,
    direction = vertical ? 'column' : 'row',
    _ref,
    ..._p
  } = props;
  const root_cls_name = useMemo(() => {
    return ["lf2ui_space", direction, className].filter(Boolean).join(' ')
  }, [className, direction])
  const items = Array.isArray(children) ? children : children ? [children] : void 0
  return (
    <div className={root_cls_name} {..._p} ref={_ref}>
      {
        items?.map((v, i) => {
          switch (v) {
            case void 0: case null: case true: case false:
              return null
          }
          if (React.isValidElement<{ show: any }>(v)) {
            if (v.type === Show && !v.props.show)
              return null
            if (v.type === Div && !v.props.show)
              return null
            if (v.type === Item)
              return v;
          }
          return (
            <Item {...item_props} key={i}>
              {v}
            </Item>
          )
        })
      }
    </div>
  )
}

export interface ISpaceItemProps extends ISpaceProps {
  direction?: 'column' | 'row';
  space?: boolean;
}

function Item(props: ISpaceItemProps) {
  const { className, space, _ref, ..._p } = props || {};
  const root_cls_name = useMemo(() => ["item", className].filter(Boolean).join(' '), [className])
  return (
    space ?
      <Space className={root_cls_name} {..._p} _ref={_ref} /> :
      <div className={root_cls_name} {..._p} ref={_ref} />
  )
}
Space.Item = Item