const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const {CleanWebpackPlugin} = require('clean-webpack-plugin');

module.exports = function (env) {
  const STAGE = env.STAGE || 'dev';
  const MODE = STAGE === 'prod' ? 'production' : 'development';

  return {
    mode: MODE,
    entry: {
      certification: './certification.ts'
    },
    output: {
      path: path.resolve(__dirname, 'dist'),
      filename: '[name].js',
      libraryTarget: 'umd'
    },
    module: {
      rules: [
        {test: /\.ts?$/, use: 'ts-loader', exclude: /node_modules/},
        {test: /\.css$/i, use: ['style-loader', 'css-loader']},
        {
          test: /\.(png|jpe?g|gif)$/i,
          use: [
            {
              loader: 'file-loader',
              options: {
                name: '[name].[ext]',
              },
            },
          ],
        },
      ]
    },
    resolve: {
      extensions: ['.js', '.ts']
    },
    plugins: [
      new HtmlWebpackPlugin({
        filename: 'index.html',
        template: './index.html'
      }),
      new HtmlWebpackPlugin({
        filename: 'simple-cert.html',
        template: './pages/simple-cert.html'
      }),
      new HtmlWebpackPlugin({
        filename: 'cert-and-verify.html',
        template: './pages/cert-and-verify.html'
      }),
      new CleanWebpackPlugin({ cleanStaleWebpackAssets: false }),
    ],
    devServer: {
      static: path.join(__dirname, 'dist'),
      compress: true,
      port: 9333
    },
    performance: {
      hints: false,
    }
  }
};
