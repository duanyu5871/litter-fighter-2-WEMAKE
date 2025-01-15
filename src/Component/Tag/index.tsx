import classNames from "classnames";
import { Cross } from "../Icons/Cross";
import { ISpaceProps, Space } from "../Space";
import { Text } from "../Text";
import styles from "./style.module.scss";

export interface ITagProps extends ISpaceProps {
  closeable?: boolean;
  on_close?: React.PointerEventHandler<SVGSVGElement>;
  size?: Text.UiSize
}
export function Tag(props: ITagProps) {
  const { children, className, closeable, on_close, ..._p } = props;
  const cls_name = classNames(styles.lfui_tag, { [styles.closeable]: closeable }, className)
  return (
    <Space className={cls_name} {..._p}>
      <Space.Broken>
        <Text size='s'>{children}</Text>
        {closeable ?
          <Text size='ss' className={styles.close}>
            <Cross hoverable onPointerDown={on_close} />
          </Text>
          : null}
      </Space.Broken>
    </Space>
  )
}