/* eslint max-len: 0 */
import webpack from 'webpack'
import merge from 'webpack-merge'
import baseConfig from './webpack.config.base'

const PORT = 3009

export default merge(baseConfig, {
  debug: true,

  devtool: 'cheap-module-eval-source-map',

  entry: [
    `webpack-hot-middleware/client?path=http://localhost:${PORT}/__webpack_hmr`,
    './app/index'
  ],

  output: {
    publicPath: `http://localhost:${PORT}/dist/`
  },

  module: {
    loaders: [
      {
        test: /pokenurse.css$/,
        loader: ('style!css')
      },
      {
        test: /\.(jpe?g|png|gif|svg|ico)$/i,
        loader: 'file'
      }
    ]
  },

  plugins: [
    new webpack.HotModuleReplacementPlugin(),
    new webpack.NoErrorsPlugin(),
    new webpack.DefinePlugin({
      'process.env.NODE_ENV': JSON.stringify('development')
    })
  ],

  target: 'electron-renderer'
})
