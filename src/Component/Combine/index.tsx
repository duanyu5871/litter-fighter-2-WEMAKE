import classnames from "classnames";
import styles from "./style.module.scss";
import { Children, useEffect, useRef, useState } from "react";
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
        lines.push(
          <div
            split-line='true'
            key={'split-line-' + lines.length}
            className={styles.lfui_combine_split_line}
            style={{
              left: '' + x + 'px',
              top: '' + y + 'px',
              width: !is_row ? '100%' : 2,
              height: is_row ? '100%' : 2,
            }} />
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
