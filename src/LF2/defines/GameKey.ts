export enum GameKey {
  /** Left */
  L = "L",
  Left = "L",

  /** Right */
  R = "R",
  Right = "R",

  /** Up */
  U = "U",
  Up = "U",

  /** Down */
  D = "D",
  Down = "D",

  /** Attack */
  a = "a",
  Attack = "a",

  /** Jump */
  j = "j",
  Jump = "j",

  /** Defend */
  d = "d",
  Defend = "d",
}
export const Labels: Record<GameKey, string> = {
  // [GameKey.L]: "◀",
  // [GameKey.R]: "▶",
  // [GameKey.U]: "▲",
  // [GameKey.D]: "▼",
  [GameKey.L]: "<",
  [GameKey.R]: ">",
  [GameKey.U]: "^",
  [GameKey.D]: "v",
  // [GameKey.L]: "←",
  // [GameKey.R]: "→",
  // [GameKey.U]: "↑",
  // [GameKey.D]: "↓",
  [GameKey.a]: "A",
  [GameKey.j]: "J",
  [GameKey.d]: "D"
}

export type TLooseGameKey = GameKey | "L" | "R" | "U" | "D" | "a" | "j" | "d";

