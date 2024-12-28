import SparkMD5 from "spark-md5";
export function __MD5(...args: string[]): string {
  const s = new SparkMD5();
  for (const t of args) s.append(t);
  return s.end();
}
