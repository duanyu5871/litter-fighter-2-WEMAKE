export class AppArgs {
  private static _parsed: { [key in string]: string } | undefined
  static argv() {
    if (this._parsed)
      return this._parsed
    this._parsed = {}
    for (let i = 0; i < process.argv.length; ++i) {
      const arg = process.argv[i]
      const [key, value] = arg.split('=')
      this._parsed[key] = value
    }
    return this._parsed
  }
  static exists(name: string): boolean {
    return this.argv().hasOwnProperty(name)
  }
  static get(name: string): string | undefined {
    return this.argv()[name]
  }
  static getOr(name: string, defaultValue: string = ''): string {
    return this.exists(name) ? this.get(name)!! : defaultValue
  }
}