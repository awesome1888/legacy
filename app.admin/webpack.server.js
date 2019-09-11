const webpack = require('webpack');
const path = require('path');
const nodeExternals = require('webpack-node-externals');
const StartServerPlugin = require('start-server-webpack-plugin');

module.exports = (env, argv) => {
    env = env || {};
    const development =
        argv.mode === 'development' || env.NODE_ENV === 'development';

    const destinationFolder = path.join(__dirname, '.build');

    return {
        entry: ['webpack/hot/poll?1000', './server/index'],
        watch: development,
        target: 'node',
        mode: development ? 'development' : 'production',
        node: {
            __filename: true,
            __dirname: true,
        },
        externals: [nodeExternals({ whitelist: ['webpack/hot/poll?1000'] })],
        resolve: {
            extensions: ['.js', '.jsx'],
            symlinks: false,
        },
        module: {
            rules: [
                {
                    test: /\.(graphql|gql)$/,
                    exclude: /node_modules/,
                    loader: 'graphql-tag/loader',
                },
                {
                    test: /\.jsx?$/,
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
                                            targets: { node: '10.0' },
                                        },
                                    ],
                                ],
                                plugins: [
                                    '@babel/plugin-proposal-object-rest-spread',
                                    '@babel/plugin-proposal-class-properties',
                                    'babel-plugin-styled-components',
                                ],
                                cacheDirectory: true,
                            },
                        },
                    ],
                    exclude: /node_modules/,
                },
                {
                    test: /\.(txt|html|css)$/,
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
        // https://webpack.js.org/configuration/devtool/
        devtool: development ? 'source-map' : false,
        plugins: [
            new webpack.IgnorePlugin(/^\.\/locale$/, /moment$/),
            new webpack.ProvidePlugin({
                _: [path.join(__dirname, `common/lib/lodash.js`), 'default'],
            }),
            new StartServerPlugin('index.js'),
            new webpack.NamedModulesPlugin(),
            new webpack.HotModuleReplacementPlugin(),
            new webpack.NoEmitOnErrorsPlugin(),
            new webpack.DefinePlugin({
                __CLIENT__: false,
                __SERVER__: true,
                __DEV__: development,
                __TEST__: false,
            }),
        ],
        output: {
            path: destinationFolder,
            filename: 'index.js',
            libraryTarget: 'commonjs',
        },
    };
};
