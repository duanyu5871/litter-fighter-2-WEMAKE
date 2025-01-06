import classnames from "classnames";
import styles from "./style.module.scss";
export interface ICombineProps extends React.HTMLAttributes<HTMLDivElement> {
  direction?: 'row' | 'column'
}
export default function Combine(props: ICombineProps) {
  const { className, direction = 'row', ..._p } = props;
  const cls_name = classnames(styles.lfui_combine, className, styles[direction])
  return (
    <div className={cls_name} {..._p} />
  );
}
