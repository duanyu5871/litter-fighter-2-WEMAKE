import Select, { ISelectProps } from './Component/Select';
export interface TeamSelectProps extends ISelectProps<string, string> { }
export default function TeamSelect(props: TeamSelectProps) {
  return (
    <Select
      items={['', '1', '2', '3', '4']}
      option={i => [i, i ? ('Team ' + i) : 'No Team']}
      {...props} />
  );
}
