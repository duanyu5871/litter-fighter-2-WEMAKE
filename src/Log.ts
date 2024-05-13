import L from '@fimagine/logger';
L.Config.currentTime = () => new Date().toISOString();
export const Log = L.Log.Clone({ showArgs: true, showRet: true, disabled: false });
export const Warn = L.Warn.Clone({ showArgs: true, showRet: true, disabled: false });
