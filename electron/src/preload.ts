
import { contextBridge, ipcRenderer } from 'electron';
import { ProgressInfo } from 'electron-updater';
import { IpcChannels } from './IpcChannels';


ipcRenderer.on('DowloadProgress', (event, data) => {
  console.log("DowloadProgress event:", event)
  console.log("DowloadProgress:", data)
})

contextBridge.exposeInMainWorld('electronAPI', {
  handleDownloadProgress: (callback: any) =>
    ipcRenderer.on(IpcChannels.DowloadProgress, callback),
  handleSetPreferenceValues: (callback: Preferences.SetPreferences) =>
    ipcRenderer.on(IpcChannels.UpdatePreferenceValues, (e, kvs) => callback(kvs)),
  handleRemovePreferencesValues: (callback: Preferences.RemovePreferences) =>
    ipcRenderer.on(IpcChannels.updateRemovePreferences, (e, keys) => callback(keys)),
  handleSetPreferenceTemplates: (callback: Preferences.SetTemplates) =>
    ipcRenderer.on(IpcChannels.UpdatePreferenceTemplates, (e, sections) => callback(sections)),
  requestPreferences: () =>
    ipcRenderer.send(IpcChannels.RequestPreferences),
  setPreferences: (kvs?: Preferences.KeyValues) =>
    ipcRenderer.send(IpcChannels.SetPreferences, kvs),
  removePreferences: (keys?: string[]) =>
    ipcRenderer.send(IpcChannels.RemovePreferences, keys),
  getPlatform: () => process.platform
})
