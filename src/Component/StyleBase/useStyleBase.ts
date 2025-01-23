import classNames from "classnames";
import { useMemo } from "react";
import styles from "../../styles/lfui_border.module.scss";
import { Variant } from "./Variant";

export function useStyleBase(variants?: Variant[] | string) {
  return {
    className: useMemo(() => classNames({
      [styles.lfui_no_border]: variants?.includes('no_border'),
      [styles.lfui_no_round]: variants?.includes('no_round'),
    }), [variants])
  }
}