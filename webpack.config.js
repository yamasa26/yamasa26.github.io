const HtmlWebpackPlugin = require('html-webpack-plugin');
const CopyPlugin = require('copy-webpack-plugin');
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const path = require('path');

module.exports = {
  entry: './src/main.js',
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'main.js',
    clean: true,
  },
  plugins: [
    new MiniCssExtractPlugin({
      filename: "styles/style.css",
    }),
    new HtmlWebpackPlugin({
      template: path.resolve(__dirname, 'public/index.html'),
      filename: 'index.html',
    }),
    new CopyPlugin({
      patterns: [
        { from: 'public', to: '.', filter: (resourcePath) => !resourcePath.endsWith('index.html') },
        { from: 'src/js', to: 'js' },
        { from: 'src/shaders', to: 'shaders' },
      ],
    }),
  ],
  module: {
    rules: [
      {
      test: /\.(glsl|vs|fs|vert|frag)$/,
      exclude: /node_modules/,
      type: 'asset/source'
      },
      {
        test: /\.(png|jpg|gif|bin)$/i,
        type: 'asset/resource',
      },
      {
        test: /\.css$/i,
        use: [MiniCssExtractPlugin.loader, "css-loader"],
      },
      {
        test: /\.(vert|frag)$/i,
        type: 'asset/source',
      },
    ]
  },
  devServer: {
    static: [
      { directory: path.join(__dirname, 'public') },
      { directory: path.join(__dirname, '.') }
    ],
    hot: true,
  },
  mode: 'development'
};