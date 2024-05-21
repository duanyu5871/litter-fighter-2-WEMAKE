import './Combine.css'
export interface ICombineProps extends React.HTMLAttributes<HTMLDivElement> {

}
export default function Combine(props: ICombineProps) {
  const { className, ...remain_props } = props;
  const rootClassName = className ? `${className} lf2ui_combine` : 'lf2ui_combine';
  return <div {...remain_props} className={rootClassName}>{props.children}</div>
}