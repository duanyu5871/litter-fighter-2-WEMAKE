import { useMemo } from "react";
import { WTF } from "./_no_id";

export function Input(props: React.InputHTMLAttributes<HTMLInputElement>) {
  const default_id = useMemo(() => 'no_id_input_' + WTF.new_id(), []);
  return <input id={default_id} title={default_id} {...props} />;
}