import "./style.scss";
import classnames from "classnames";
export interface ICombineProps extends React.HTMLAttributes<HTMLDivElement> {
  direction?: 'row' | 'column'
}
export default function Combine(props: ICombineProps) {
  const { className, direction = 'row', ..._p } = props;
  const cls_name = classnames('lf2ui_combine', className, direction)
  return (
    <div {..._p} className={cls_name}>
      {props.children}
    </div>
  );
}
