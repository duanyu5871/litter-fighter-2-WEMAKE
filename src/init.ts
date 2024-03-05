import L from '@fimagine/logger';
L.Config.currentTime = () => new Date().toISOString().replaceAll(/T/g, ' ').replace('Z', '');

(window as any).Log = L.Log.Clone({ showArgs: true, showRet: true, disabled: false });
(window as any).Warn = L.Warn.Clone({ showArgs: true, showRet: true, disabled: false });