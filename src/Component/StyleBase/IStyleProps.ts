import { UiSize } from "../Text";
import { TVariant } from "./Variant";

export interface IStyleProps {
  variants?: TVariant[] | string;
  size?: UiSize;
}