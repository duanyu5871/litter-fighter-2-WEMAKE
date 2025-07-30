export class MersenneTwister {
  private n: number = 624;
  private m: number = 397;
  private matrixA: number = 0x9908B0DF;
  private upperMask: number = 0x80000000;
  private lowerMask: number = 0x7FFFFFFF;
  private mt: number[] = new Array(this.n);
  private index: number = this.n + 1;

  reset(seed: number) {
    this.n = 624;
    this.m = 397;
    this.matrixA = 0x9908B0DF;
    this.upperMask = 0x80000000;
    this.lowerMask = 0x7FFFFFFF;
    this.mt = new Array(this.n);
    this.index = this.n + 1;
    this.mt[0] = seed >>> 0;
    for (let i = 1; i < this.n; i++) {
      const s = this.mt[i - 1] ^ (this.mt[i - 1] >>> 30);
      this.mt[i] = (((((s & 0xFFFF0000) >>> 16) * 1812433253) << 16) + (s & 0x0000FFFF) * 1812433253) + i;
      this.mt[i] >>>= 0; // 转换为32位无符号整数
    }
  }
  constructor(seed: number = Date.now()) {
    this.reset(seed)
  }

  // 生成下一组624个值
  private twist(): void {
    for (let i = 0; i < this.n; i++) {
      let x = (this.mt[i] & this.upperMask) | (this.mt[(i + 1) % this.n] & this.lowerMask);
      let xA = x >>> 1;
      if (x % 2 !== 0) {
        xA ^= this.matrixA;
      }
      this.mt[i] = this.mt[(i + this.m) % this.n] ^ xA;
    }
    this.index = 0;
  }

  // 提取伪随机数
  public int(): number {
    if (this.index >= this.n) {
      this.twist();
    }

    let y = this.mt[this.index++];

    // 额外的位操作以改善分布
    y ^= (y >>> 11);
    y ^= (y << 7) & 0x9D2C5680;
    y ^= (y << 15) & 0xEFC60000;
    y ^= (y >>> 18);

    return y >>> 0; // 确保返回32位无符号整数
  }

  // 生成[0,1)范围内的浮点数
  public float(): number {
    return this.int() / (0xFFFFFFFF + 1);
  }

  // 生成[min, max)范围内的整数
  public in_range(min: number, max: number): number {
    return Math.floor(this.float() * (max - min)) + min;
  }
}
