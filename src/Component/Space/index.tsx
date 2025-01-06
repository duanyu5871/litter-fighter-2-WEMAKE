import React, { useMemo } from "react";
import Show, { Div } from "../Show";
import './styles.scss';
import classNames from "classnames";
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
  const root_cls_name = useMemo(() => classNames("lf2ui_space", direction, className), [className, direction])

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
  frame?: boolean;
  hoverable_frame?: boolean;
}

function Item(props: ISpaceItemProps) {
  const { className, space, hoverable_frame, frame, _ref, ..._p } = props || {};
  const root_cls_name = useMemo(() => classNames("item", { frame, hoverable_frame }, className), [className, frame, hoverable_frame])
  return (
    space ?
      <Space className={root_cls_name} {..._p} _ref={_ref} /> :
      <div className={root_cls_name} {..._p} ref={_ref} />
  )
}
Space.Item = Item