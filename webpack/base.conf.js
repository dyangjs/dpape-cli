'use strict';
var HtmlWebpackPlugin = require("html-webpack-plugin");
const { VueLoaderPlugin } = require('vue-loader');
var path = require('path');
const uuid = process.env.uuid;
const allConfig = require(`./${uuid}/webpack.json`);
const resourcePackage = require(`../.resource/${allConfig.uuid}/package.json`);
const routerParams = require(path.join(allConfig.currentPath, `./.temp/router-config.json`));
const projectType = allConfig.type || 'SPA';
/** 读取配置 */
const commontConfig = allConfig.common || new Object();
const aliasConfig = commontConfig.alias;
const mainPath = commontConfig.mainPath || 'src';
const currentPath = allConfig.currentPath || process.cwd();
var alias = {
    '@src': path.resolve(`${currentPath}/${mainPath}`)
};
for (const key in aliasConfig) {
    if (!aliasConfig.hasOwnProperty(key)) continue;
    const v = aliasConfig[key];
    alias[key] = path.resolve(`${currentPath}/${mainPath}/${v}`);
}
const aliaList = [{
        name: "vue$",
        path: "/vue/dist/vue.runtime.esm.js"
    },
    {
        name: "vuex$",
        path: "/vuex/dist/vuex.js"
    },
    {
        name: "vconsole$",
        path: "/vconsole"
    },
    {
        name: "vue-router$",
        path: "/vue-router"
    },
    {
        name: "fastclick$",
        path: "/fastclick"
    },
    {
        name: "axios$",
        path: "/axios"
    }
];
const baseModulePath = path.resolve(__dirname, './node_modules');
const dependencies = resourcePackage.dependencies;
aliaList.map(v => {
    const name = v.name.replace('$', '')
    const isExist = dependencies[name];
    const base = isExist ? path.resolve(__dirname, `../.resource/${allConfig.uuid}/node_modules`) : baseModulePath;
    alias[v.name] = path.resolve(`${base}/${v.path}`);
});
alias["dyang-router$"] = path.join(currentPath, `./.temp/routers.js`);
alias["dyang-ajax$"] = path.join(currentPath, `./.temp/request.js`);
alias["dyang-filter$"] = path.join(currentPath, `./.temp/filter.js`);
const packages = allConfig.packages || new Object();
const packageNanes = Object.keys(packages);
packageNanes.map(name => {
    alias[name] = path.resolve(__dirname, `../.resource/${allConfig.uuid}/node_modules/${name}`);
});
let entryMain = {
    app: ["babel-polyfill", path.join(currentPath, `./.temp/main.js`)]
}
let htmlConfig = [new HtmlWebpackPlugin({
    filename: 'index.html',
    template: path.join(currentPath, `./.temp/index.html`),
    inject: true
})];
if (projectType === 'MPA') {
    entryMain = new Object();
    htmlConfig = new Array();
    routerParams.map(v => {
        entryMain[v.name] = ["babel-polyfill", path.resolve(`${currentPath}/${mainPath}/pages/${v.name}/index.js`)];
        htmlConfig.push(new HtmlWebpackPlugin({
            filename: `${v.name}.html`,
            template: path.join(currentPath, `./.temp/index.html`),
            inject: true,
            chunks: [v.name]
        }))
    });
};
let requiredImportList = typeof allConfig.requiredImport === 'object' ? Object.keys(allConfig.requiredImport) : new Array();
/** 读取配置End */
module.exports = {
    entry: entryMain,
    output: {
        path: path.resolve(`${currentPath}/${commontConfig.output || 'dist'}`),
        filename: 'js/[name].[hash:8].js',
        chunkFilename: 'js/[name].[hash:8].js'
    },
    module: {
        rules: [{
                test: /\.js$/,
                loader: 'babel-loader',
                options: {
                    presets: [
                        "@babel/preset-env"
                    ]
                },
                include: [
                    path.join(currentPath, `./${mainPath}`),
                    path.join(currentPath, `./.temp`)
                ],
                exclude: /node_module/
            },
            {
                test: /\.vue$/,
                loader: 'vue-loader',
                options: {
                    cssSourceMap: false,
                    cacheBusting: false,
                    preserveWhitespace: false,
                    transformToRequire: {
                        video: [commontConfig.mainPath || 'src', 'poster'],
                        source: path.resolve(currentPath, `/${commontConfig.mainPath || 'src'}`),
                        img: commontConfig.mainPath || 'src',
                        image: 'xlink:href'
                    }
                }
            },
            {
                test: /\.(jsx|tsx|js|ts)$/,
                loader: "dyang-import-loader",
                options: {
                    /* 是否全局引入默认为true,需要按需引入设置为false*/
                    global: false,
                    /** 按需引入目录名称 默认lib*/
                    libraryDirectory: allConfig.requiredImport,
                    /* 组件库名称 默认vue-dyangui*/
                    libraryName: requiredImportList
                }
            }, {
                test: /\.(jsx|tsx|js|ts|vue)$/,
                loader: path.resolve(__dirname, './tran.js')
            }, {
                test: /\.(jsx|tsx|js|ts|vue)$/,
                loader: path.resolve(__dirname, './precompile.js')
            },
            {
                test: /\.pdf$/,
                use: {
                    loader: 'file-loader',
                    options: {
                        name: './assets/doc/[name].[ext]'
                    }
                }
            }
        ]
    },
    plugins: [...htmlConfig, ...[
        new VueLoaderPlugin()
    ]],
    resolve: {
        extensions: ['.js', '.vue', '.json'],
        /** 编译配置 */
        alias: alias
    }
}