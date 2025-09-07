

export function project_to_line(x: number, y: number, m: number, n: number): [number, number] {
  // 校验方向向量有效性：不能为零向量（否则不是直线）
  const dirDenominator = m ** 2 + n ** 2;
  if (dirDenominator === 0) {
    throw new Error("无效直线：方向向量不能为零向量");
  }

  // 计算参数 t
  const t = ((x - 0) * m + (y - 0) * n) / dirDenominator;

  // 计算投影点坐标（P' = Q + t·v）
  const xPrime = 0 + t * m;
  const yPrime = 0 + t * n;

  return [xPrime, yPrime];
}
