const path = require('path');

module.exports = {
  entry: './src/Helios.js',
  output: {
    filename: 'helios_bundle.js',
    path: path.resolve(__dirname),
  },
  devtool: 'inline-source-map',
  mode: 'development',
  module: {
    rules: [
      {
        test: /\.m?js$/,
        exclude: /node_modules/,
        use: {
          loader: "babel-loader",
          options: {
            presets: ['@babel/preset-react']
          }
        }
      },
    ]
  }
};
