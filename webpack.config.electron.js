import webpack from 'webpack'
import merge from 'webpack-merge'
import baseConfig from './webpack.config.base'

export default merge(baseConfig, {
  devtool: 'source-map',

  entry: ['babel-polyfill', './app/main.development.js'],

  output: {
    path: __dirname,
    filename: './app/main.js'
  },

  plugins: [
    new webpack.optimize.UglifyJsPlugin({
      compressor: {
        warnings: false
      }
    }),
    // Add source map support for stack traces in node
    // https://github.com/evanw/node-source-map-support
    // new webpack.BannerPlugin(
    //   'require("source-map-support").install();',
    //   { raw: true, entryOnly: false }
    // ),
    new webpack.DefinePlugin({
      'process.env': {
        NODE_ENV: JSON.stringify('production')
      }
    })
  ],

  target: 'electron-main',

  node: {
    __dirname: false,
    __filename: false
  },

  externals: [
    // 'source-map-support',
    'electron-devtools-installer',
  ],

  noParse: /json-schema\/lib\/validate\.js/
})
