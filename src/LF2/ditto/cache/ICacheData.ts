export interface ICacheData {
  id: number;
  name: string;
  version: number;
  type: string;
  data: Uint8Array;
  create_date: number;
}
