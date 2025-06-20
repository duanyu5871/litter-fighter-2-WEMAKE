import { IExpression } from "./IExpression";
import { TNextFrame } from "./INextFrame";
import { IPos } from "./IPos";
/**
 * 条件动作
 * 
 * 简单的来说，就是满足条件时，做点什么
 */
export interface IAction_Base {
  /**
   * 条件表达式
   * 
   * @type {string}
   * @memberof IAction_Base
   */
  test?: string;

  /**
   * 条件测试器
   * 
   * 一般应该在读取数据时，通过test生成
   * 
   * 当test不存在，tester也不存在
   * 
   * 无条件测试器时，一般视为测试通过。
   * 
   * @see {IAction_Base.test}
   * @type {?IExpression<any>}
   */
  tester?: IExpression<any>;
}

/**
 * 动作: 播放声音
 */
export interface IAction_Sound extends IAction_Base {
  type: 'sound';

  /**
   * 声音文件路径
   */
  path: string[];

  /**
   * 播放位置
   */
  pos?: IPos;
}

/**
 * 动作: 进入指定帧数
 */
export interface IAction_NextFrame extends IAction_Base {
  type: 'next_frame';

  /**
   * 指定帧
   */
  data: TNextFrame;
}
export interface IAction_SetProp extends IAction_Base {
  type: 'set_prop';
  prop_name: string;
  prop_value: any;
}
export interface IAction_Defend extends IAction_Base {
  type: 'defend';
  data: TNextFrame;
}
export interface IAction_BrokenDefend extends IAction_Base {
  type: 'broken_defend';
  data: TNextFrame;
}
export type TAction = IAction_Sound | IAction_NextFrame | IAction_SetProp |
  IAction_Defend | IAction_BrokenDefend