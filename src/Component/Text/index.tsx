import classNames from "classnames";
import styles from "./styles.module.scss"
export type UiSize = 'ss' | 's' | 'm' | 'l'
export interface ITextProps extends React.HTMLAttributes<HTMLSpanElement> {
  size?: UiSize;
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


export namespace Text {
  export type UiSize = 'ss' | 's' | 'm' | 'l';
}