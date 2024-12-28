export namespace WTF {
  let _no_id = 0;
  export const new_id = () => ++_no_id;
}
