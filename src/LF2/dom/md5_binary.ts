import SparkMD5 from "spark-md5";

export default function md5_binary(content: string): string {
  return SparkMD5.hashBinary(content);
}
