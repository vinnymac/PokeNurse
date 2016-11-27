/* eslint max-len: 0 */
import webpack from 'webpack'
import validate from 'webpack-validator'
import merge from 'webpack-merge'
import baseConfig from './webpack.config.base'

const PORT = process.env.PORT || 3009

export default validate(merge(baseConfig, {
  debug: true,

  devtool: 'cheap-module-eval-source-map',

  entry: [
    `webpack-hot-middleware/client?path=http://localhost:${PORT}/__webpack_hmr`,
    'babel-polyfill',
    './app/index'
  ],

  output: {
    publicPath: `http://localhost:${PORT}/dist/`
  },

  plugins: [
    new webpack.HotModuleReplacementPlugin(),
    new webpack.NoErrorsPlugin(),
    new webpack.DefinePlugin({
      'process.env.NODE_ENV': JSON.stringify('development')
    })
  ],

  target: 'electron-renderer'
}))
