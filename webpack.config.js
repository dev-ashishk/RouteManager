const path = require('path');
const webpack = require('webpack');
const nodeExternals = require('webpack-node-externals');

module.exports = {
    // entry: './src/index.js',
    target: 'node',
    entry: {
        server: './server.js',
        client: './src/index.js',
    },
    mode: 'development',
    output: {
        path: path.resolve(__dirname, 'public'),
        filename: '[name].bundle.js'
    },
    module: {
        rules: [
            {
                test: /\.js$/,
                exclude: /node_modules/,
                use: {
                    loader: "babel-loader"
                }
            }
        ]
    },
    stats: {
        colors: true
    },
    devtool: 'source-map'
};