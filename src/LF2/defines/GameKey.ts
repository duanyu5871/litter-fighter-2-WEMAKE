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
export type GK = GameKey;
export const GK = GameKey;
export type LGK = GK | "L" | "R" | "U" | "D" | "a" | "j" | "d";
export const Labels: Record<LGK, string> = {
  [GK.L]: "<",
  [GK.R]: ">",
  [GK.U]: "^",
  [GK.D]: "v",
  [GK.a]: "A",
  [GK.j]: "J",
  [GK.d]: "D"
}


