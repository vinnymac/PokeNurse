import webpack from 'webpack'
// import ExtractTextPlugin from 'extract-text-webpack-plugin';
import merge from 'webpack-merge'
import baseConfig from './webpack.config.base'

const config = merge(baseConfig, {
  devtool: 'cheap-module-source-map',

  entry: [
    'babel-polyfill',
    './app/index',
  ],

  output: {
    publicPath: '../dist/'
  },

  plugins: [
    new webpack.optimize.OccurrenceOrderPlugin(),
    new webpack.DefinePlugin({
      'process.env.NODE_ENV': JSON.stringify('production')
    }),
    new webpack.optimize.UglifyJsPlugin({
      compressor: {
        screw_ie8: true,
        warnings: false
      }
    })
  ],

  target: 'electron-renderer'
})

export default config
