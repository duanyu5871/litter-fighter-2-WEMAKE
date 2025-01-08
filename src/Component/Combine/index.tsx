import classnames from "classnames";
import { CSSProperties, useEffect, useRef, useState } from "react";
import styles from "./style.module.scss";
export interface ICombineProps extends React.HTMLAttributes<HTMLDivElement> {
  direction?: 'row' | 'column',
  hoverable?: boolean
}
export default function Combine(props: ICombineProps) {
  const { className, direction = 'row',
    hoverable = true, children, ..._p } = props;
  const cls_name = classnames(styles.lfui_combine, styles[direction],
    { [styles.hoverable]: hoverable }, className)
  const ref = useRef<HTMLDivElement>(null)
  const [lines, set_lines] = useState<React.ReactNode[]>([])
  useEffect(() => {
    const ele = ref.current;
    if (!ele) return;

    const update = () => {
      const lines: React.ReactNode[] = []
      const is_row = getComputedStyle(ele).flexDirection === 'row';
      let i = -1
      for (const child of ele.children) {
        if (!++i) continue;
        if (child.getAttribute("split-line")) continue;
        const { offsetLeft: x, offsetTop: y } = (child as HTMLElement)
        const style: React.CSSProperties = is_row ? {
          left: `${x - 4}px`,
          width: 2,
          height: '100%',
        } : {
          top: `${y - 4}px`,
          height: 2,
          width: '100%',
        }
        lines.push(
          <div
            split-line='true'
            key={'split-line-' + lines.length}
            className={styles.lfui_combine_split_line}
            style={style} />
        )
      }
      set_lines(lines)
    }

    const ob_1 = new ResizeObserver(update);
    ob_1.observe(ele)
    update();

    const watch_children = () => {
      for (const child of ele.children) {
        if (child.getAttribute("split-line")) continue;
        ob_1.observe(child)
      }
    }
    const ob_2 = new MutationObserver(watch_children)
    ob_2.observe(ele, { childList: true })
    watch_children();
    return () => {
      ob_1.disconnect();
      ob_2.disconnect();
    }
  }, [])

  return (
    <div className={cls_name} {..._p} ref={ref}>
      {children}
      {lines}
    </div>
  );
}
