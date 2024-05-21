import './Input.css'
export function Input(props: React.InputHTMLAttributes<HTMLInputElement>) {
  const { className, ...remain_props } = props;
  const root_className = className ? `lf2ui_input ${className}` : 'lf2ui_input'
  return <input {...remain_props} className={root_className} />;
}
