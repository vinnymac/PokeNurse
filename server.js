/* eslint no-console: 0 */

import express from 'express'
import webpack from 'webpack'
import webpackDevMiddleware from 'webpack-dev-middleware'
import webpackHotMiddleware from 'webpack-hot-middleware'
import Dashboard from 'webpack-dashboard'
import DashboardPlugin from 'webpack-dashboard/plugin'
import { exec } from 'child_process'

import config from './webpack.config.development'

const argv = require('minimist')(process.argv.slice(2))

const PORT = 3009
const app = express()
const compiler = webpack(config)

if (argv.dashboard) {
  const dashboard = new Dashboard()
  compiler.apply(new DashboardPlugin(dashboard.setData))
}

const webpackDevMiddlwareConfig = {
  quiet: argv.dashboard,
  publicPath: config.output.publicPath,
  stats: {
    colors: true
  }
}

const wdm = webpackDevMiddleware(compiler, webpackDevMiddlwareConfig)

app.use(wdm)

const webpackHotMiddlewareConfig = argv.dashboard ? { log: () => {} } : {}

app.use(webpackHotMiddleware(compiler, webpackHotMiddlewareConfig))

const server = app.listen(PORT, 'localhost', (err) => {
  if (err) {
    return console.error(err)
  }

  exec('npm run start-hot', (_error, stdout, stderr) => {
    if (_error) {
      return console.error(`exec error: ${_error}`)
    }

    return [
      console.log(`stdout: ${stdout}`),
      console.log(`stderr: ${stderr}`)
    ]
  })

  console.log(`Listening at http://localhost:${PORT}`)
})

server.on('error', (e) => {
  console.error(e)
})

process.on('SIGTERM', () => {
  console.log('Stopping dev server')
  wdm.close()
  server.close(() => {
    process.exit(0)
  })
})
