const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
// postcss plugins are loaded from the package CJS config

module.exports = {
  mode: 'production',
  entry: ['core-js/stable', 'regenerator-runtime/runtime', './src/main.tsx'],
  target: ['web', 'es5'],
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: [
          { loader: 'babel-loader' },
          { loader: 'ts-loader' }
        ],
        exclude: /node_modules/
      },
      {
        test: /\.css$/i,
        use: [
          'style-loader',
          { loader: 'css-loader', options: { importLoaders: 1 } },
          {
            loader: 'postcss-loader',
            options: {
              postcssOptions: require(path.resolve(__dirname, '../../packages/tailwind-config/postcss.config.cjs'))
            }
          }
        ],
         // allow CSS from app and workspace packages
      },
      {
        test: /\.png$/,
        loader: 'file-loader',
        exclude: /node_modules/
      }
    ]
  },
  resolve: {
    extensions: ['.tsx', '.ts', '.js', '.jsx'],
    alias: (() => {
      const reactDir = path.dirname(require.resolve('react/package.json'));
      const reactDomDir = path.dirname(require.resolve('react-dom/package.json'));
      return {
        '@smart-tv/tailwind-config': path.resolve(__dirname, '../../packages/tailwind-config/shared-styles.css'),
        react: reactDir,
        'react/jsx-runtime': path.join(reactDir, 'jsx-runtime.js'),
        'react-dom': reactDomDir,
        'react-dom/client': path.join(reactDomDir, 'client.js')
      };
    })()
  },
  externals: [/^lodash(\/.+)?$/],
  output: {
    filename: 'index.js',
    path: path.resolve(__dirname, 'dist'),
    libraryTarget: 'umd',
    clean: true,
    globalObject: 'this'
  },
  plugins: [
    new HtmlWebpackPlugin({
      filename: 'index.html',
      template: path.resolve('./', 'index.html')
    })
  ]
};
