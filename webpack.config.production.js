import webpack from 'webpack'
// import ExtractTextPlugin from 'extract-text-webpack-plugin';
import merge from 'webpack-merge'
import baseConfig from './webpack.config.base'

const config = merge(baseConfig, {
  devtool: 'cheap-module-source-map',

  entry: './app/index',

  output: {
    publicPath: '../dist/'
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
