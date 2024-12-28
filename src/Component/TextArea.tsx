import React, { useMemo } from "react";
import { WTF } from "./_no_id";

type TextAreaProps = React.TextareaHTMLAttributes<HTMLTextAreaElement>;
export const TextArea = React.forwardRef<HTMLTextAreaElement, TextAreaProps>(
  function (
    props: TextAreaProps,
    ref: React.ForwardedRef<HTMLTextAreaElement>,
  ) {
    const default_id = useMemo(() => "no_id_textarea_" + WTF.new_id(), []);
    return <textarea id={default_id} title={default_id} {...props} ref={ref} />;
  },
);
