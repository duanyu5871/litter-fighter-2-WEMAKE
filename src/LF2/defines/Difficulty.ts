
export enum Difficulty {
  Easy = 1,
  Normal = 2,
  Difficult = 3,
  Crazy = 4
}
export const DifficultyNames: Record<Difficulty, string> = {
  [Difficulty.Easy]: "Easy",
  [Difficulty.Normal]: "Normal",
  [Difficulty.Difficult]: "Difficult",
  [Difficulty.Crazy]: "Crazy!",
};