import { useEffect, useState } from 'react';
import { is_str } from './js_utils/is_str';
import { is_fun } from './js_utils/is_fun';
import { is_num } from './js_utils/is_num';

export function useLocalString<S extends string = string>(name: string): [S, React.Dispatch<S>];
export function useLocalString<S extends string = string>(name: string, initialState: S | (() => S)): [S, React.Dispatch<S>];
export function useLocalString<S extends string = string>(name: string, initialState?: S | (() => S)): [S | undefined, React.Dispatch<S | undefined>] {
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


export function useLocalNumber<S extends number = number>(name: string): [S, React.Dispatch<S>];
export function useLocalNumber<S extends number = number>(name: string, initialState: S | (() => S)): [S, React.Dispatch<S>];
export function useLocalNumber<S extends number = number>(name: string, initialState?: S | (() => S)): [S | undefined, React.Dispatch<S | undefined>] {
  const [val, set_val] = useState<S | undefined>(() => {
    let v = localStorage.getItem(name);
    if (is_str(v)) return Number(v) as S;
    const ret = is_str(initialState) ? initialState : is_fun(initialState) ? initialState() : void 0;
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

