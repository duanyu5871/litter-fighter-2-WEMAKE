export const app_error = (...args: any[]) => { throw new Error('[deployer]' + args.join(' ')) }
export const app_log = (...args: any[]) => console.log('[deployer]', ...args);