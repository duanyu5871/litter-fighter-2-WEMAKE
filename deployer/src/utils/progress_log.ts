
let last_line_len = 0;

export const progress_log = (verbose: any, ...args: any[]) => {
  args.unshift('[deployer]')
  if (verbose) return console.log(...args);

  let line = args.join(' ');
  let pre_line_len = last_line_len;
  last_line_len = line.length
  while (pre_line_len > line.length)
    line += ' '
  process.stdout.write(line + '\r')
}
export const progress_log_end = (verbose: any, ...args: any[]) => {
  args.unshift('[deployer]')
  if (verbose) return console.log(...args);

  let line = args.join(' ');
  let pre_line_len = last_line_len;
  while (pre_line_len > line.length)
    line += ' '
  process.stdout.write(line + '\n')
}
export const progress_log_start = (verbose: any, ...args: any[]) => {
  args.unshift('[deployer]')
  return console.log('\n');
}