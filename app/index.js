import React from 'react'
import { render } from 'react-dom'
import { AppContainer } from 'react-hot-loader'

import App from './app'
import './app.global.css'

const rootEl = document.getElementById('content')

render(<AppContainer><App /></AppContainer>, rootEl)

if (module.hot) {
  module.hot.accept('./app', () => {
    const NextApp = require('./app') // eslint-disable-line

    render(<AppContainer><NextApp /></AppContainer>, rootEl)
  })
}
