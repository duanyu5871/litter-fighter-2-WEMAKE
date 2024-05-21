import React from "react";
export default function Titled(props: React.PropsWithChildren<{ title: React.ReactNode; }>) {
  return (
    <div className='name_content'>
      <span>{props.title}</span>
      {props.children}
    </div>
  );
}
