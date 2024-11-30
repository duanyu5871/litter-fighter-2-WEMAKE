import L from '@fimagine/logger';
L.Config.currentTime = () => new Date().toISOString().replaceAll(/T/g, ' ').replace('Z', '');
export const Log = Object.assign(
  L.Log.Clone({ showArgs: true, showRet: true, disabled: false }),
  {
    print(...args: any[]) {
      return console.warn(...args);
    }
  }
)

export const Warn = Object.assign(
  L.Warn.Clone({ showArgs: true, showRet: true, disabled: false }),
  {
    print(...args: any[]) {
      return console.warn(...args);
    }
  }
);