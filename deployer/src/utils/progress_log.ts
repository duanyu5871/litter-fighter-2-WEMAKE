

export namespace progress_log {
  let last_line_len = 0;
  export let verbose: boolean = true;
  export const log = (...args: any[]) => {
    args.unshift('[deployer]')
    if (verbose) return console.log(...args);

    let line = args.join(' ');
    let pre_line_len = last_line_len;
    last_line_len = line.length
    while (pre_line_len > line.length)
      line += ' '
    process.stdout.write(line + '\r')
  }
  export const end = (...args: any[]) => {
    args.unshift('[deployer]')
    if (verbose) return console.log(...args);

    let line = args.join(' ');
    let pre_line_len = last_line_len;
    while (pre_line_len > line.length)
      line += ' '
    process.stdout.write(line + '\n')
  }
  export const start = (...args: any[]) => {
    args.unshift('[deployer]')
    return console.log(...args);
  }
}
export default progress_log;