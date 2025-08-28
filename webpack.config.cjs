const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const TerserPlugin = require('terser-webpack-plugin');

module.exports = (env, argv) => {
  const isProduction = argv.mode === 'production';
  
  return {
    mode: isProduction ? 'production' : 'development',
    entry: './src/main.tsx',
    target: ['web', 'es5'], // Same as Norigin Spatial Navigation
    module: {
      rules: [
        {
          test: /\.tsx?$/,
          use: [
            {
              loader: 'ts-loader',
              options: {
                configFile: 'tsconfig.json'
              }
            }
          ],
          exclude: /node_modules/
        },
        {
          test: /\.css$/,
          use: [
            isProduction ? MiniCssExtractPlugin.loader : 'style-loader',
            'css-loader'
          ]
        }
      ]
    },
    resolve: {
      extensions: ['.tsx', '.ts', '.js', '.jsx']
    },
    output: {
      filename: 'assets/index.js',
      path: path.resolve(__dirname, 'dist'),
      clean: true,
      globalObject: 'this', // Same as Norigin config
      library: {
        name: 'SmartTVApp',
        type: 'umd'
      }
    },
    plugins: [
      new HtmlWebpackPlugin({
        template: './index.html',
        filename: 'index.html',
        inject: false, // We'll manually inject scripts for better control
        templateParameters: {
          isProduction
        }
      }),
      ...(isProduction ? [
        new MiniCssExtractPlugin({
          filename: 'assets/style.css'
        })
      ] : [])
    ],
    devServer: {
      static: {
        directory: path.join(__dirname, 'dist'),
      },
      compress: true,
      port: 3000,
      host: '0.0.0.0',
      hot: true
    },
    optimization: {
      minimize: isProduction,
      minimizer: isProduction ? [
        // Use terser for ES5 compatibility
        new TerserPlugin({
          terserOptions: {
            ecma: 5,
            compress: {
              drop_console: false,
              drop_debugger: true,
              ecma: 5
            },
            format: {
              ecma: 5,
              comments: false
            },
            mangle: {
              safari10: true
            }
          }
        })
      ] : []
    }
  };
};
