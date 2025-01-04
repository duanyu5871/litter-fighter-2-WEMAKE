import type { TNextFrame } from ".";
import type { IExpression } from "./IExpression";
import { IPos } from "./IPos";
import type { IQube } from "./IQube";
import type { IQubePair } from "./IQubePair";
import { IRect } from "./IRect";

export interface IBdyInfo extends IQube {
  /**
   * 预制信息id
   *
   * @see {?string}
   */
  prefab_id?: string;

  /**
   * [WEMAKE]
   * 是否判定同队Itr
   * 0=关闭（默认），1=开启
   *
   * @type {?number}
   */
  friendly_fire?: number;

  /**
   * [LF2][WEMAKE]
   * @see {BdyKind}
   *
   * @type {number}
   */
  kind: number;

  /**
   * [WEMAKE]
   *
   * @type {?IQubePair}
   */
  indicator_info?: IQubePair;

  break_act?: TNextFrame;


  /** @deprecated */ hit_act?: TNextFrame;

  actions?: TAction[]

  test?: string;

  tester?: IExpression<any>;
}

interface IAction_Base {
  test?: string;
  tester?: IExpression<any>;
}
interface IAction_Sound extends IAction_Base {
  type: 'sound';
  path: string[];
  pos?: IPos;
}
interface IAction_NextFrame extends IAction_Base {
  type: 'next_frame';
  data: TNextFrame;
}
type TAction = IAction_Sound | IAction_NextFrame
