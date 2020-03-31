'use strict'
var merge = require('webpack-merge');
var webpack = require('webpack');
var baseConfig = require('./base.conf');
const dyangTemp = process.env.uuid;
const config = require(`./${dyangTemp}/webpack.json`);
var OpenBrowserPlugin = require('open-browser-webpack-plugin');
/** 读取配置 */
const devServer = {
    port: config.devServerPort,
    host: '0.0.0.0',
    hot: true,
    open: false
}
var openUrl = 'http://localhost:' + config.devServerPort;
let env = config.dev;
env.BASE_API = config.BASE_API_DEV;
/** 读取配置End */

module.exports = merge(baseConfig, {
    devServer: devServer,
    mode: 'development',
    devtool: 'source-map',
    cache: true,
    module: {
        rules: [{
                test: /\.(sa|sc|c)ss$/,
                use: [
                    'style-loader',
                    'css-loader',
                    {
                        loader: 'postcss-loader',
                        options: {
                            plugins: [require("autoprefixer")([
                                "last 10 Chrome versions",
                                "last 5 Firefox versions",
                                "Safari >= 6",
                                "ie > 8"
                            ])]
                        }
                    },
                    'sass-loader'
                ]
            },
            {
                test: /\.(png|jpe?g|gif|svg)$/,
                loader: 'url-loader',
                query: {
                    // 把较小的图片转换成base64的字符串内嵌在生成的js文件里
                    limit: 10000,
                    // 路径要与当前配置文件下的publicPath相结合
                    name: './assets/images/[name].[ext]?[hash:7]',
                    publicPath: './'
                }
            },
            {
                test: /\.(eot|woff|woff2|svg|ttf|otf)([\?]?.*)$/,
                loader: 'file-loader',
                query: {
                    // 把较小的图标转换成base64的字符串内嵌在生成的js文件里    
                    limit: 10000,
                    name: './assets/fonts/[name].[ext]?[hash:7]',
                    prefix: 'font',
                    publicPath: './'
                }
            },
            // 加载音频
            {
                test: /\.(mp3|wav|mp4)(\?.*)?$/,
                loader: 'url-loader',
                options: {
                    limit: 1024,
                    name: './assets/meta/[name].[hash:7].[ext]',
                    publicPath: './'

                }
            }
        ]
    },
    plugins: [
        new OpenBrowserPlugin({
            url: openUrl
        }),
        new webpack.HotModuleReplacementPlugin(),
        new webpack.DefinePlugin({
            'process.env': env
        })
    ]
});