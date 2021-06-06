const path = require('path');

module.exports = {
  entry: './src/indexSQL2.js',
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'webpack-numbers.js',
    library: 'indexSQL',
   libraryTarget: 'umd',
  },
  externals: {
    lodash: {
      commonjs: 'lodash',
      commonjs2: 'lodash',
      amd: 'lodash',
      root: '_',
    },
  },
};