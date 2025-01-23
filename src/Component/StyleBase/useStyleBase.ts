import classNames from "classnames";
import { useMemo } from "react";
import styles from "../../styles/lfui_border.module.scss";
import { TVariant } from "./Variant";

export function useStyleBase(variants?: TVariant[] | string) {
  return {
    className: useMemo(() => classNames({
      [styles.lfui_no_border]: variants?.includes('no_border'),
      [styles.lfui_no_round]: variants?.includes('no_round'),
    }), [variants])
  }
}