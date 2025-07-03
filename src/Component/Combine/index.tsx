import classnames from "classnames";
import React, { isValidElement, useMemo, useRef } from "react";
import styles from "./style.module.scss";
export interface ICombineProps extends React.HTMLAttributes<HTMLDivElement> {
  direction?: 'row' | 'column',
  hoverable?: boolean
}
export default function Combine(props: ICombineProps) {
  const { className, direction = 'row',
    hoverable = true, children, ..._p } = props;
  const cls_name = classnames(
    styles.lfui_combine,
    styles[direction],
    { [styles.hoverable]: hoverable },
    className
  )
  const ref = useRef<HTMLDivElement>(null)
  const _children = useMemo(() => {
    if (!children || !Array.isArray(children)) return children;
    return children.map((child, index) => {
      if (!isValidElement<any>(child)) {
        return <div key={index} className={styles.item}>{child}</div>
      }
      const style: React.CSSProperties = {
        flex: child.props['data-flex'] ?? void 0
      }
      return <div key={index} className={styles.item} style={style}>{child}</div>
    })
  }, [children])
  return (
    <div className={cls_name} {..._p} ref={ref}>
      {_children}
    </div>
  );
}
