import { useEffect, useState } from 'react';
import { is_str, is_fun, is_num, is_bool, not_empty_str } from './LF2/utils/type_check';

type T_RET<S> = readonly [S, React.Dispatch<React.SetStateAction<S>>]
type T_IN<S> = S | (() => S);
const __clear_flag = '1001'
if (localStorage.getItem('__clear_flag') !== __clear_flag) {
  localStorage.clear();
  localStorage.setItem('__clear_flag', __clear_flag);
}
export function useLocalString<S extends string = string>(name: string): T_RET<S | undefined>;
export function useLocalString<S extends string = string>(name: string, initialState: T_IN<S>): T_RET<S>;
export function useLocalString<S extends string = string>(name: string, initialState?: T_IN<S>): T_RET<S> | T_RET<S | undefined> {
  const [val, set_val] = useState<S | undefined>(() => {
    let v = localStorage.getItem(name);
    if (is_str(v)) return v as S;
    const ret = is_str(initialState) ? initialState : is_fun(initialState) ? initialState() : void 0;
    if (is_str(ret)) localStorage.setItem(name, ret);
    return ret as S;
  });
  useEffect(() => {
    if (is_str(val))
      localStorage.setItem(name, val);

    else
      localStorage.removeItem(name);
  }, [name, val]);
  return [val, set_val];
}


export function useLocalNumber<S extends number = number>(name: string): T_RET<S | undefined>;
export function useLocalNumber<S extends number = number>(name: string, initialState: T_IN<S>): T_RET<S>;
export function useLocalNumber<S extends number = number>(name: string, initialState?: T_IN<S>): T_RET<S> | T_RET<S | undefined> {
  const [val, set_val] = useState<S | undefined>(() => {
    let v = localStorage.getItem(name);
    if (not_empty_str(v)) {
      const n = Number(v);
      if (is_num(n)) return n as S
    };
    const ret = is_num(initialState) ? initialState : is_fun(initialState) ? initialState() : void 0;
    if (is_num(ret)) localStorage.setItem(name, '' + ret);
    return ret as S;
  });
  useEffect(() => {
    if (is_num(val))
      localStorage.setItem(name, '' + val);
    else
      localStorage.removeItem(name);
  }, [name, val]);
  return [val, set_val];
}

export function useLocalBoolean(name: string): T_RET<boolean | undefined>;
export function useLocalBoolean(name: string, initialState: T_IN<boolean>): T_RET<boolean>;
export function useLocalBoolean(name: string, initialState?: T_IN<boolean>): T_RET<boolean> | T_RET<boolean | undefined> {
  const [val, set_val] = useState<boolean | undefined>(() => {
    let v = localStorage.getItem(name);
    if (is_str(v)) return v === 'true';
    const ret = is_bool(initialState) ? initialState : is_fun(initialState) ? initialState() : void 0;
    if (is_bool(ret)) localStorage.setItem(name, '' + ret);
    return ret as boolean;
  });
  useEffect(() => {
    if (is_bool(val)) {
      localStorage.setItem(name, '' + val);
    } else {
      localStorage.removeItem(name);
    }
  }, [name, val]);
  return [val, set_val];
}
