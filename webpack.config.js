const path = require('path');

module.exports = {
  entry: './Helios.js',
  output: {
    filename: 'helios_bundle.js',
    path: path.resolve(__dirname),
  },
  devtool: 'inline-source-map',
  mode: 'development',
};
