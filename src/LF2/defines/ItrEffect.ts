import type { IBdyInfo } from "./IBdyInfo";
import type { IItrInfo } from "./IItrInfo";
export enum ItrEffect {
  /**
   * 普通效果
   */
  Normal = 0,

  /**
   * 利器
   *
   * 攻击效果是血花
   */
  Sharp = 1,

  /**
   * 着火
   */
  Fire = 2,

  /**
   * 结冰
   * 
   * 使不被冰封的人被冰封。被冰封（state：13）的人碎冰。
   */
  Ice = 3,

  /**
   * 穿过敌人(仅能打中type 1.2.3.4.5.6的物件)
   */
  Through = 4,

  /**
   * 没效果，也打不中任何东西
   */
  None = 5,

  /**
   * 火焰攻击_1
   *
   * 用于：
   * * [X] LF2
   * * [X] WEMAKE
   *
   * - 原版中：
   *    - 能攻击队友（着火的人烧到队友就是用此实现的）
   *
   * - WEMAKE中：
   *    - 能不能攻击队友是通过itr.friendly_fire于bdy.friendly_fire决定的。
   *
   * @see {IItrInfo.friendly_fire}
   * @see {IBdyInfo.friendly_fire}
   */
  MFire1 = 20,

  /** 定身火 ?? */
  MFire2 = 21,

  /**
   * 爆炸类的攻击(带火焰效果)
   * 
   * 用于：
   * * [X] LF2
   * * [X] WEMAKE
   * 
   * 攻击方向将根据攻受两方的X轴位置决定（攻击方向决定了击飞速度的方向），
   * 以此实现左边被打的往左飞，右边被打的往右飞的效果。
   * 被击中的角色将着火。
   *
   * 例: firen d^j
   */
  FireExplosion = 22,

  /**
   * 爆炸类的攻击
   * 
   * 用于：
   * * [X] LF2
   * * [X] WEMAKE
   * 
   * 攻击方向将根据攻受两方的X轴位置决定（攻击方向决定了击飞速度的方向），
   * 以此实现左边被打的往左飞，右边被打的往右飞的效果。
   *
   * 例: julian d^j
   */
  Explosion = 23,

  /**
   * 结冰
   * 
   * 用于：
   * * [X] LF2
   * * [X] WEMAKE
   * 
   * 使不被冰封的人被冰封。无法攻击，被冰封（state：13）的人。
   */
  Ice2 = 30
}
