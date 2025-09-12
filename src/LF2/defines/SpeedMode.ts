export enum SpeedMode {
  LF2 = 0,
  /** 
   * 跟随方向加速度 
   */
  Acc = 1,

  FixedLf2 = 2,
  
  /** 
   * 固定方向加速 
   */
  FixedAcc = 3,

  /** 
   * 加速直至到达指定速度
   * 
   */
  AccTo = 4,

  /**
   * 
   */
  Extra = 5,

  Fixed = 6,
}
