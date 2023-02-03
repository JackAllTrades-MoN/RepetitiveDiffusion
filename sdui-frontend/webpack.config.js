const path = require('path');
const MiniCssExtractPlugin = require("mini-css-extract-plugin")

module.exports = {
    devtool: 'inline-source-map',
    entry: {
        bundle: './src/index.tsx'
    },
    output: {
        path: path.join(__dirname, 'dist'),
        filename: '[name].js',
        publicPath: '/',
    },
    resolve: {
        extensions: ['.tsx', '.ts', '.js']
    },
    module: {
        rules: [
            {
                test:/\.tsx?$/, loader: 'ts-loader'
            },
            {
                test:/\.(gif|jpg|png)$/, loader: 'url-loader'
            },
            {
                test:/\.css$/i,
                use: [MiniCssExtractPlugin.loader, 'css-loader'],
            },
        ],
    },
    devServer: {
        historyApiFallback: true,
        static: [
            {
                directory: path.join(__dirname, "dist")
            },
            {
                directory: path.join(__dirname, '../sdui/static'),
                publicPath: '/static'
            }
        ],
    },
    plugins: [
        new MiniCssExtractPlugin(),
    ],
}