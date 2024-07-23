
import Path from 'path'
import { app } from 'electron';
import FS from 'fs/promises'
const Tag = '[AppPreferences]'
export default class Preferences {
  private static __insts: { [key in string]?: Preferences } = {}
  static async get(fileName = 'app_preferences') {
    var inst = this.__insts[fileName]
    if (!inst) {
      inst = new Preferences(fileName)
    }
    try {
      await inst.load()
    } catch (e) {
      console.error(Tag, 'inst.load()', e)
    }
    return inst
  }

  private __loaded = false
  private __fileName = 'app_preferences'
  private __obj: any = {}
  private constructor(fileName = 'app_preferences') {
    this.__fileName = fileName
  }
  private async path() {
    return Path.join(app.getPath('userData'), this.__fileName)
  }
  private async load() {
    try {
      const path = await this.path()
      const stat = await FS.stat(path)
      if (stat.isFile()) {
        const buffer = await FS.readFile(path, "utf8")
        this.__obj = JSON.parse(buffer)
      } else {
        this.__obj = {}
      }
      this.__loaded = true
    } catch (e) {
      console.error(Tag, 'load()', e)
    }
  }
  get obj() { return this.__obj }
  loaded() {
    return this.__loaded
  }
  exists(k: string) {
    return this.__obj.hasOwnProperty(k)
  }
  set(k: string, v: any) {
    this.__obj[k] = v
    return this
  }
  merge(kvs: { [key in string]: any }) {
    for (const k in kvs)
      this.__obj[k] = kvs[k]
    return this
  }
  removes(ks: string[]) {
    ks.forEach(k => delete this.__obj[k])
    return this
  }
  remove(k: string) {
    delete this.__obj[k]
    return this
  }
  get<T = any>(k: string, defaultValue?: T): T {
    return this.exists(k) ? this.__obj[k] : defaultValue
  }
  async commit() {
    try {
      const path = await this.path()
      const data = JSON.stringify(this.__obj)
      await FS.writeFile(path, data, "utf8")
    } catch (e) {
      console.error(Tag, 'commit()', e)
    }
  }
}