import LF2 from "../LF2";
import type { Keyboard } from "./Keyboard";

export default class Ditto {
  keyboard_initializer(keyboard: Keyboard): void { };
  keyboard_disposer(keyboard: Keyboard): void { };
}