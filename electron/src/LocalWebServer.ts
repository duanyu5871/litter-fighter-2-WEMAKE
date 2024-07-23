import path from 'path'
import express from 'express';
import type http from 'http'

type Express = ReturnType<typeof express>
const Tag = '[LocalWebServer]'
export class LocalWebServer {
  private _express: Express | undefined | null
  private _server: http.Server | undefined | null
  private _path: string
  private _port: number = 0
  private _randomUA: string = ''
  constructor(path: string) {
    this._path = path
  }
  setRandomUA(randomUA: string): LocalWebServer {
    this._randomUA = randomUA
    return this
  }
  setPort(port: number): LocalWebServer {
    this._port = port
    return this
  }
  express() {
    this._express = this._express || express()
    return this._express
  }
  server() {
    return this._server
  }
  address() {
    return this._server?.address()
  }
  start(): Promise<http.Server> {
    return new Promise((resolve, reject) => {
      const app = this.express()

      app.get('*', (req, res, next) => {
        const ua = req.header('user-agent')
        if (!this._randomUA)
          return next()
        else if (ua && ua.indexOf(this._randomUA) >= 0)
          return next()
        res.send("拒绝访问")
      })
      app.use(express.static(this._path))
      // app.get('*', (req, res) => res.sendFile(path.join(this._path, 'index.html')))
      console.debug(Tag, 'start() try to start at port:', this._port)
      const server = app.listen(this._port, () => {
        server.removeListener('error', handleFirstErr)
        console.debug(Tag, 'start() started, listen at', JSON.stringify(server.address()))
        resolve(server)
      });
      const handleFirstErr = (e: Error) => {
        if (this._port !== 0) {
          console.debug(Tag, `start() 无法在端口${this._port}启动本地web服务，尝试由系统分配端口。`)
          this._port = 0
          this.start().then(resolve).catch(reject)
        } else {
          console.debug(Tag, 'start() 无法启动本地web服务!')
          reject(e)
        }
      }
      server.on('close', (...args) => console.debug('close,', ...args))
        .on('error', (...args) => console.error('error, ', ...args))
        .once('error', handleFirstErr)
      this._server = server
    })
  }
}

