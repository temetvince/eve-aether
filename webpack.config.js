import HtmlWebpackPlugin from 'html-webpack-plugin';
import { resolve as _resolve, join } from 'path';
import CopyWebpackPlugin from 'copy-webpack-plugin';

const here = import.meta.dirname;

/**
 * Bundles the app.
 *
 * Babel does the transpiling here and never typechecks; `npm run typecheck` is
 * what proves the types, and the build script runs it before this.
 *
 * @param {unknown} env - webpack environment, unused.
 * @param {Readonly<{ mode?: string }>} argv - CLI arguments; `mode` selects the build.
 * @returns {import('webpack').Configuration} The configuration.
 */
export default (env, argv) => {
  const isProd = argv.mode === 'production';

  return {
    entry: './src/index.tsx',

    mode: isProd ? 'production' : 'development',
    devtool: isProd ? 'source-map' : 'inline-source-map',

    output: {
      path: _resolve(here, 'dist'),
      filename: 'js/[name].[contenthash:8].js',
      publicPath: '/',
      // Wipe stale hashed files on every rebuild.
      clean: true,
    },

    target: 'web',

    devServer: {
      port: 3000,
      static: { directory: join(here, 'public') },
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
          test: /\.(?:js|jsx|ts|tsx)$/u,
          exclude: /node_modules/u,
          use: 'babel-loader',
        },
        {
          test: /\.css$/u,
          use: ['style-loader', 'css-loader'],
        },
        {
          test: /\.(?:jpe?g|png|gif|svg|webp)$/iu,
          type: 'asset/resource',
          generator: {
            filename: 'assets/[name].[contenthash:8][ext]',
          },
        },
      ],
    },

    plugins: [
      new CopyWebpackPlugin({
        patterns: [{ from: join(here, 'CNAME'), to: '.' }],
      }),
      new HtmlWebpackPlugin({
        template: join(here, 'public', 'index.html'),
        filename: 'index.html',
        inject: true,
        templateParameters: { BASE_HREF: '/' },
      }),
    ],

    // React alone is most of the bundle, so webpack's stock 244 KiB advice can
    // never be met here and would warn on every build. The budget below sits
    // just above where the app is today, which keeps the check meaningful: it
    // stays quiet now and speaks up on a real regression.
    performance: {
      hints: isProd ? 'warning' : false,
      maxEntrypointSize: 320 * 1024,
      maxAssetSize: 320 * 1024,
    },

    optimization: {
      splitChunks: {
        chunks: 'all',
        cacheGroups: {
          vendor: {
            test: /[\\/]node_modules[\\/]/u,
            name: 'vendors',
            chunks: 'all',
          },
        },
      },
    },
  };
};
