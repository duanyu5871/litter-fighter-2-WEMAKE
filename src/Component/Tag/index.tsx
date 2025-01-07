import classNames from "classnames";
import { Close } from "../Icons/Clear";
import { ISpaceProps, Space } from "../Space";
import styles from "./style.module.scss";

export interface ITagProps extends ISpaceProps {
  closeable?: boolean;
  on_close?: React.PointerEventHandler<SVGSVGElement>;
}
export function Tag(props: ITagProps) {
  const { children, className, closeable, on_close, ..._p } = props;
  const cls_name = classNames(styles.lfui_tag, { [styles.closeable]: closeable }, className)
  return (
    <Space className={cls_name} {..._p}>
      <Space.Broken>
        <span className={styles.label}>{children}</span>
        {closeable ? <Close hoverable onPointerDown={on_close} /> : null}
      </Space.Broken>
    </Space>
  )
}