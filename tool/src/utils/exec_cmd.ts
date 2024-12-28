import { spawn } from "child_process";

export async function exec_cmd(cmd: string, ...args: string[]) {
  await new Promise((resolve, reject) => {
    const temp = spawn(cmd, args).on("exit", resolve).on("error", reject);
    temp.stderr.on("data", (buf: Buffer) =>
      console.error("[stderr]: ", buf.toString()),
    );
  });
}
