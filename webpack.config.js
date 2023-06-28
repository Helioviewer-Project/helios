const path = require('path');

module.exports = {
  entry: './src/Helios.js',
  output: {
    filename: 'helios_bundle.js',
    path: path.resolve(__dirname),
  },
  devtool: 'inline-source-map',
  mode: 'development',
  resolve: {
    extensions: [".ts", ".tsx", ".js", ".css"],
  },
  module: {
    rules: [
      {
        test: /\.css$/i,
        use: [
          "style-loader",
          {loader: "css-loader", options: {modules: true}}],
      },
      // All files with a '.ts' or '.tsx' extension will be handled by 'ts-loader'.
      { test: /\.tsx?$/, loader: "ts-loader" },
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
