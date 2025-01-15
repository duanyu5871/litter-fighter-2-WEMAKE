import classNames from "classnames";
import styles from "./styles.module.scss"
export interface ITextProps extends React.HTMLAttributes<HTMLSpanElement> {
  size?: 's' | 'm' | 'l';
}
export function Text(props: ITextProps) {
  const { className, size = 'm', ..._p } = props;
  return <span className={classNames(styles.lfui_txt, styles[size], className)} {..._p} />
}
export function Strong(props: ITextProps) {
  const { className, size = 'm', ..._p } = props;
  return <strong className={classNames(styles.lfui_txt, styles[size], className)} {..._p} />
}
Text.Strong = Strong;