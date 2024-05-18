export interface IStageObjectInfo {
  id_method?: string; // TODO
  id: string[];
  x: number;
  y?: number;
  z?: number;
  act?: string;
  hp?: number;
  times?: number;
  ratio?: number;
  is_boss?: true;
  is_soldier?: true;
  reserve?: number;
  join?: number;
}
