/* eslint no-console: 0 */

import express from 'express'
import webpack from 'webpack'
import webpackDevMiddleware from 'webpack-dev-middleware'
import webpackHotMiddleware from 'webpack-hot-middleware'
import Dashboard from 'webpack-dashboard'
import DashboardPlugin from 'webpack-dashboard/plugin'

import config from './webpack.config.development'

const app = express()
const compiler = webpack(config)
const dashboard = new Dashboard()
compiler.apply(new DashboardPlugin(dashboard.setData))
const PORT = 3009

const wdm = webpackDevMiddleware(compiler, {
  quiet: true,
  publicPath: config.output.publicPath,
  stats: {
    colors: true
  }
})

app.use(wdm)

app.use(webpackHotMiddleware(compiler, {
  log: () => {}
}))

const server = app.listen(PORT, 'localhost', err => {
  if (err) {
    console.error(err)
    return
  }

  console.log(`Listening at http://localhost:${PORT}`)
})

server.on('error', e => {
  console.error(e)
})

process.on('SIGTERM', () => {
  console.log('Stopping dev server')
  wdm.close()
  server.close(() => {
    process.exit(0)
  })
})
