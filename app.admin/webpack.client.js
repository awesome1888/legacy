const webpack = require('webpack');
const path = require('path');
const resolve = require('resolve');
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer')
    .BundleAnalyzerPlugin;
const ForkTsCheckerWebpackPlugin = require('fork-ts-checker-webpack-plugin-alt');
const typescriptFormatter = require('react-dev-utils/typescriptFormatter');

module.exports = (env, argv) => {
    env = env || {};
    const development =
        argv.mode === 'development' || env.NODE_ENV === 'development';

    const sourceFolder = path.join(__dirname, 'common');
    const destinationFolder = path.join(__dirname, '.build');

    return {
        entry: [
            'react-hot-loader/patch',
            'webpack-dev-server/client?http://localhost:3001',
            'webpack/hot/only-dev-server',
            './client/index',
        ],
        target: 'web',
        mode: development ? 'development' : 'production',
        resolve: {
            extensions: ['.js', '.jsx', '.ts', '.tsx'],
            symlinks: false,
        },
        devtool: development ? 'source-map' : false,
        module: {
            rules: [
                {
                    test: /\.(j|t)sx?$/,
                    enforce: 'pre',
                    use: [
                        {
                            options: {
                                formatter: require.resolve(
                                    'react-dev-utils/eslintFormatter',
                                ),
                                eslintPath: require.resolve('eslint'),
                                emitWarning: true,
                            },
                            loader: require.resolve('eslint-loader'),
                        },
                    ],
                    include: sourceFolder,
                },
                {
                    test: /\.(graphql|gql)$/,
                    exclude: /node_modules/,
                    loader: 'graphql-tag/loader',
                },
                {
                    test: /\.(j|t)sx?$/,
                    use: [
                        {
                            loader: 'babel-loader',
                            options: {
                                presets: [
                                    '@babel/react',
                                    [
                                        '@babel/env',
                                        {
                                            modules: false,
                                            targets: {
                                                browsers: ['last 2 versions'],
                                            },
                                        },
                                    ],
                                    '@babel/preset-typescript',
                                ],
                                plugins: [
                                    '@babel/plugin-proposal-object-rest-spread',
                                    '@babel/plugin-proposal-class-properties',
                                    'babel-plugin-styled-components',
                                ],
                            },
                        },
                    ],
                    include: [path.join(__dirname, 'client'), sourceFolder],
                },
                {
                    test: /\.(txt|html)$/,
                    use: 'raw-loader',
                },
                {
                    test: /\.(jpe?g|gif|png|svg|ico)$/i,
                    use: [
                        {
                            loader: 'url-loader',
                            options: {
                                limit: 8192,
                            },
                        },
                    ],
                },
            ],
        },
        plugins: [
            new ForkTsCheckerWebpackPlugin({
                typescript: resolve.sync('typescript', {
                    basedir: path.join(__dirname, 'node_modules'),
                }),
                async: false,
                checkSyntacticErrors: true,
                tsconfig: path.join(__dirname, 'tsconfig.json'),
                compilerOptions: {
                    module: 'esnext',
                    moduleResolution: 'node',
                    resolveJsonModule: true,
                    isolatedModules: true,
                    noEmit: true,
                    jsx: 'preserve',
                },
                reportFiles: [
                    '**',
                    '!**/*.json',
                    '!**/__test__/**',
                    '!**/?(*.)(spec|test).*',
                ],
                watch: sourceFolder,
                silent: true,
                formatter: typescriptFormatter,
            }),
            new webpack.IgnorePlugin(/^\.\/locale$/, /moment$/),
            new webpack.ProvidePlugin({
                _: [path.join(__dirname, 'common/lib/lodash.js'), 'default'],
            }),
            new webpack.NamedModulesPlugin(),
            new webpack.HotModuleReplacementPlugin(),
            new webpack.NoEmitOnErrorsPlugin(),
            new webpack.DefinePlugin({
                __CLIENT__: true,
                __SERVER__: false,
                __DEV__: development,
                __TEST__: false,
            }),
            new BundleAnalyzerPlugin({
                analyzerHost: '0.0.0.0',
                analyzerPort: '8888',
            }),
        ],
        devServer: {
            host: '0.0.0.0',
            port: 3001,
            historyApiFallback: true,
            hot: true,
            headers: {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Headers': '*',
            },
            overlay: true,
        },
        output: {
            path: destinationFolder,
            publicPath: 'http://localhost:3001/',
            filename: 'client.js',
        },
    };
};
