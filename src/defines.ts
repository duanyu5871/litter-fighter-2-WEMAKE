

export namespace Defines {
  export enum State {
    Any = -1,
    Standing = 0,
    Walking = 1,
    Running = 2,
    Attacking = 3,
    Jump = 4,
    Dash = 5,
    Defend = 7,
    BrokenDefend = 8,
    Catching = 9,
    Caught = 10,
    Injured = 11,
    Falling = 12,
    Lying = 14,
    Ice = 15,
    Tired = 16,
  }
  export enum ItrKind {
    Normal = 0,       // 特殊特技
    Catch = 1,        // 捉住暈眩(state 16) |的人
    Pick = 2,         // 撿武器
    ForceCatch = 3,   // 強迫抓人a
    SuperPunchMe = 6, // 敵人靠近按A時是重击
    PickWith = 7,     // 撿武器不影響动作
    Heal = 8,         // injury数值变成治療多少hp，动作跳至dvx ?
    DeadWhenHit = 9,  // 打中敵人自己hp歸0(如John的防護罩) |
    MagicFlute = 10,  // henry魔王之樂章效果
    Block = 14,       // 阻擋
    Fly = 15,         // 飛起 ??
    Ice = 16,         // 結冰
    // 1???=被你打到會跳到第???个frame(如人質的kind)
  }
  export enum ItrEffect {
    Normal = 0,   // 拳击
    Sharp = 1,    // 利器攻击
    Fire = 2,     // 著火
    Ice = 3,      // 結冰
    Through = 4,  // 穿過敵人(僅能打中type 1.2.3.4.5.6的物件) |
    None = 5,     // (或以上) |沒效果，也打不中任何東西
    MFire1 = 20,  // 定身火 ??
    MFire2 = 21,  // 定身火 ??
    MFire3 = 22,  // 定身火 ??
    MIce = 30,    // 定身冰 ??
  }
}