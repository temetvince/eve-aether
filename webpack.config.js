 
import HtmlWebpackPlugin from 'html-webpack-plugin';
import { resolve as _resolve, join, dirname } from 'path';
// import CopyWebpackPlugin from 'copy-webpack-plugin';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

export default (env, argv) => {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
  const isProd = argv.mode === 'production';

  return {
    entry: './src/index.tsx',

    mode: isProd ? 'production' : 'development',
    devtool: isProd ? 'source-map' : 'inline-source-map',

    output: {
      path: _resolve(__dirname, 'dist'),
      filename: 'js/[name].[contenthash:8].js',   // hashed name + folder
      publicPath: isProd ? '/' : '/',
      clean: true,                               // wipe old files on rebuild
    },

    target: 'web',

    devServer: {
      port: '3000',
      static: { directory: join(__dirname, 'public') },
      open: true,
      hot: true,
      liveReload: true,
      historyApiFallback: true,
    },

    resolve: {
      extensions: ['.ts', '.tsx', '.js', '.jsx', '.json'],
    },

    module: {
      rules: [
        {
          test: /\.(js|jsx|ts|tsx)$/,
          exclude: /node_modules/,
          use: 'babel-loader',
        },
        {
          test: /\.css$/,
          use: ['style-loader', 'css-loader'],
        },
        {
          test: /\.(jpe?g|png|gif|svg|webp)$/i,
          type: 'asset/resource',
          generator: {
            filename: 'assets/[name].[contenthash:8][ext]',
          },
        },
      ],
    },

    plugins: [
      // new CopyWebpackPlugin({
      //   patterns: [
      //     { from: join(__dirname, 'CNAME'), to: '.' },
      //   ],
      // }),
      new HtmlWebpackPlugin({
        template: join(__dirname, 'public', 'index.html'),
        filename: 'index.html',
        inject: true,
        // Pass BASE_HREF for <base> tag
        templateParameters: {
          BASE_HREF: isProd ? '/' : '/',
        },
      }),
    ],

    optimization: {
      splitChunks: {
        chunks: 'all',
        cacheGroups: {
          vendor: {
            test: /[\\/]node_modules[\\/]/,
            name: 'vendors',
            chunks: 'all',
          },
        },
      },
    },
  };
};
