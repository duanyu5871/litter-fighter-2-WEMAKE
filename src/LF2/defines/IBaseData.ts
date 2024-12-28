export interface IBaseData<I = any> {
  id: string;
  /**
   * @see {IDataMap}
   */
  type: string;
  base: I;
}
