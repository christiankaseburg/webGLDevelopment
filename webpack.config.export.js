const path = require('path');
const UglifyJSPlugin = require('uglifyjs-webpack-plugin');

module.exports = {
  mode: 'production',
  entry: { 
    godrays: './src/experiments/godrays/godrays.ts'
    // Example to add another project entry ->test: './src/experiments/test/godrays.ts'
  },
  module: {
    rules: [
      { test: /\.tsx?$/, use: 'ts-loader', exclude: /node_modules/ },
      { test: /\.(glsl|frag|vert)$/, exclude: /node_modules/, use: 'raw-loader' },
      { test: /\.(glsl|frag|vert)$/, exclude: /node_modules/, use: 'glslify-loader' },
    ]
  },
  resolve: {
    extensions: [ '.tsx', '.ts', '.js' ]
  },
  output: { // Output work around to bundle each experiment into there own bundle
    path: path.resolve(__dirname, 'src/experiments/'),
    filename: '[name]/dist/bundle.js'
  },
  plugins: [
    new UglifyJSPlugin()
  ],
  performance: { hints: false }
};

//"start": "concurrently \"npm run tsc:w\" \"npm run lite\" "