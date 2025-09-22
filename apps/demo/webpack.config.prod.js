const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
  mode: 'production',
  entry: ['core-js/stable', 'regenerator-runtime/runtime', './src/main.tsx'],
  target: ['web', 'es5'],
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: [
          { loader: 'ts-loader' },
          {
            loader: 'babel-loader',
            options: {
              presets: [
                [
                  '@babel/preset-env',
                  {
                    targets: { chrome: '35' },
                    useBuiltIns: 'entry',
                    corejs: 3
                  }
                ],
                ['@babel/preset-react', { runtime: 'automatic' }]
              ]
            }
          }
        ],
        exclude: /node_modules/
      },
      // Transpile modern JS inside node_modules (some packages ship ESM/modern builds)
      {
        test: /\.m?js$/,
        include: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: [[
              '@babel/preset-env',
              { targets: { chrome: '35' } }
            ]]
          }
        }
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
  // no externals for the app bundle — include lodash in the build
  output: {
    filename: '[name].js',
    path: path.resolve(__dirname, 'dist'),
    libraryTarget: 'umd',
    globalObject: 'this',
    // ensure webpack runtime emits ES5-friendly syntax
  //   environment: {
  //     arrowFunction: false,
  //     const: false,
  //     destructuring: false,
  //     forOf: false,
  //     dynamicImport: false,
  //     module: false
  //   }
  },
  // optimization: {
  //   minimize: true,
  //   minimizer: [
  //     new TerserPlugin({
  //       terserOptions: {
  //         ecma: 5,
  //         compress: { ecma: 5 },
  //         mangle: true,
  //         output: { ecma: 5 }
  //       }
  //     })
  //   ]
  // },
  plugins: [
    new HtmlWebpackPlugin({
      filename: 'index.html',
      template: path.resolve('./', 'index.html')
    })
  ]
};
