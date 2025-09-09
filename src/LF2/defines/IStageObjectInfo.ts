export interface IStageObjectInfo {
  id_method?: string; // TODO
  id: string[];
  x: number;
  y?: number;
  z?: number;
  act?: string;
  hp?: number;
  mp?: number;
  times?: number;
  ratio?: number;
  is_boss?: true;
  is_soldier?: true;
  reserve?: number;

  /**
   * 敌人被击败后，归降后的血量。
   * 若无此字段，敌人不会归降
   *
   * @type {?number}
   */
  join?: number;
  join_team?: string;
}
