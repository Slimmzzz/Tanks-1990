const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const { CleanWebpackPlugin } = require('clean-webpack-plugin')

module.exports = {
  entry: './src/app.ts',
  output: {
    filename: 'bundle.js',
    path: path.resolve(__dirname, 'dist'),
    clean: true,
  },
  plugins: [
    new CleanWebpackPlugin(),
    
    new HtmlWebpackPlugin({
			title: 'Tanks 1990',
      template: './src/index.html',
      filename: 'index.html'
    }),
  ],
	
  module: {
    rules: [
      { test: /.ts$/i, use: 'ts-loader' },
      {
          test: /\.scss$/i,
          use: ["style-loader", "css-loader", "sass-loader"],
      },
      {
          test: /\.(png|svg|jpg|jpeg|gif)$/i,
          type: 'asset/resource',
      },
    ],
  },
};