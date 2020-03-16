import * as fs from 'fs';
import * as path from 'path';
import { GetProjectConfig, GetCurrentIpAddress } from '../common/utils';
import { spawn } from 'child_process';
var md5 = require('md5');
interface routerItem {
    path:string
    name:string
    redirect?:string,
    component?:any,
    meta?:any
}
/** 构建项目配置文件 */
export function BuildConfigInfo(key:string){
    DeletTempConfigFile(key);
    const currentPath = process.cwd();
    const tempPath = path.join(currentPath,`./.temp`);
    fs.mkdirSync(tempPath,{
        recursive:true
    });
    const config = GetProjectConfig();
    const common = config.common || new Object();
    let xhtml = fs.readFileSync(path.resolve(__dirname,'../../build-files/index.html'),'utf-8');        
    xhtml = xhtml.replace('{{appName}}',common.appName);
    fs.writeFileSync(path.resolve(`${tempPath}/index.html`),xhtml,'utf-8');
    if( config.type === 'MPA'){
        BuildMpaRouterConfig(key);
    }else{
        BuildRouterConfig(key);
        buildMainJs(key);
        fs.writeFileSync(path.resolve(`${tempPath}/router-config.json`),JSON.stringify([],null,'\t'),'utf-8');
    }
    buildAxiosConfig(key);
    config.currentPath = currentPath;
    const webpackPath = path.resolve(__dirname,`../../webpack/${config.uuid}`);
    if(!fs.existsSync(webpackPath)){
        fs.mkdirSync(webpackPath,{recursive:!0});
    }
    const ip = GetCurrentIpAddress();
    config.devServerHost = ip;
    fs.writeFileSync(path.join(webpackPath,'./webpack.json'),JSON.stringify(config,null,'\t'),'utf-8');
    /** 构建Base Vue Filter */
    const filterPath = path.resolve(__dirname,'../../build-files/main-filter.js');
    let filterCtx = fs.readFileSync(filterPath,'utf-8');    
    const isWin = process.platform === 'win32';
    let selfFilterPath = `${currentPath}/${common.mainPath}/filter.js`;
    if(isWin) selfFilterPath = selfFilterPath.replace(/\\/g,"\/").replace(/\:/,":\\");
    filterCtx = filterCtx.replace('%%selfFilter%%',selfFilterPath);
    fs.writeFileSync(path.resolve(`${tempPath}/filter.js`),filterCtx,'utf-8');
}

/** 构建路由配置 */
export function BuildRouterConfig(key:string){
    const config = GetProjectConfig();
    const common = config.common || new Object();
    const currentPath = process.cwd();
    const pagesPath = `${currentPath}/${common.mainPath}/pages`;
    if(!fs.existsSync(pagesPath)){
        throw Error('Pages Folder Not Exist');
    }
    const files = fs.readdirSync(pagesPath);
    const routers:Array<routerItem> = [
        {
            path: '/',
            name: "index",
            redirect:common.mainRouter || 'home'
        }
    ];
    files.forEach((file:any)=>{
        const curPath = pagesPath + "/" + file;
        if(!fs.statSync(curPath).isDirectory()) return;
        const vuePath = `${curPath}/index.vue`;
        if(!fs.existsSync(vuePath)) return;
        const pageConfigPath = `${curPath}/config.json`;
        const hasPageConfig = fs.existsSync(pageConfigPath);
        let routerData:routerItem = {
            path:`/${file}`,
            name:file,
            component:`%%resolve => require(['${vuePath}'], resolve)%%`
        };
        if(hasPageConfig){
            const pageConfigString = fs.readFileSync(pageConfigPath,'utf-8');
            try{
                const pageConfig = JSON.parse(pageConfigString);
                if(pageConfig.path) routerData.path = pageConfig.path;
                if(pageConfig.name) routerData.name = pageConfig.name;
                if(pageConfig.meta) routerData.meta = pageConfig.meta;
            }catch(error){
                console.log((`Invalid JSON Format,Please Check [${pageConfigPath}]`));
                return;
            }
        }
        routers.push(routerData)
    });
    const notFountPath = path.resolve(`${pagesPath}/404/index.vue`);
    if(config.hasNotFoundPage && fs.existsSync(notFountPath)){
        routers.push({
            path: '*',
            name: 'notfount',
            component:`%%resolve => require(['${notFountPath}'], resolve)%%`
        })
    }
    let routerString = JSON.stringify(routers,null,'\t');
    routerString = routerString.replace(/[\' | \" ]\%\%/g,"").replace(/\%\%[\' | \" ]/g,"");
    const ctx = `
import Vue from 'vue';
import VueRouter from 'vue-router';
import { Merge } from 'vue-dyangui/@library/utils';
Vue.use(VueRouter);
const router = new VueRouter({
    routes:${routerString}
})
router.beforeEach((to, form, next) => {
    window.back = null;
    if (form.params.backParams) {
        var backParams = Merge(to.params, form.params.backParams);
        for (let key in backParams) {
            to.params[key] = backParams[key];
        }
    }
    next();
})
export default router;
    `;
    fs.writeFileSync(path.join(currentPath,`./.temp/routers.js`),ctx,'utf-8');

}

/** 删除配置文件 */
export function DeletTempConfigFile(key:string,cPath?:string){
    const currentPath = process.cwd();
    return new Promise((resolve,reject)=>{
        try{
            const FolderPath = cPath ? cPath : path.join(currentPath,`./.temp`);
            if(!fs.existsSync(FolderPath)) return;    
            const files = fs.readdirSync(FolderPath);
            files.forEach((file,index)=>{
                const curPath = FolderPath + "/" + file;
                if(fs.statSync(curPath).isDirectory()) {
                    DeletTempConfigFile(key,curPath);
                    return;
                };
                fs.unlinkSync(curPath); //删除文件
                if(!cPath && files.length - 1 == index) resolve();
            });
            fs.rmdirSync(FolderPath);
        }catch(error){
            reject();
            throw Error('Error Server');
        }
    })
}

/** 构建入口文件 */
export function buildMainJs(key:string){
    const config = GetProjectConfig();
    const common = config.common || new Object();
    const currentPath = process.cwd();
    const mainJsPath = path.resolve(__dirname,'../../build-files/main.js');
    let mainJsCtx = fs.readFileSync(mainJsPath,'utf-8');
    const vueMainPath = path.resolve(`${currentPath}/${common.mainPath || 'src'}/main.vue`);
    const storePath = path.resolve(`${currentPath}/${common.mainPath || 'src'}/store.js`);
    const mainCssPath = path.resolve(`${currentPath}/${common.mainPath || 'src'}/css/main.scss`);
    const componentPath =path.resolve( `${currentPath}/${common.mainPath || 'src'}/components.js`);
    const elementId = common.elementId || '#app';
    const replaceConfig = {
        vueMainPath,
        storePath,
        mainCssPath,
        elementId,
        componentPath
    };    
    const replaceKeys = Object.keys(replaceConfig);
    replaceKeys.map(key=>{
        if (!replaceConfig.hasOwnProperty(key)) return;
        const v = replaceConfig[key];
        const reg = new RegExp(`\\%\\%${key}\\%\\%`,'g');
        const isWin = process.platform === 'win32';
        const value = key === 'elementId' ? v : (isWin ? v.replace(/\\/g,"\/").replace(/\:/,":\\") : v);
        mainJsCtx = mainJsCtx.replace(reg,value);
    });
    fs.writeFileSync(path.join(currentPath,`./.temp/main.js`),mainJsCtx,'utf-8');
}

/** 构建项目 */
export async function BuildFileDist(){
    const params3Value = process.argv[3];
    const isAdmin:boolean = params3Value === 'admin';
    if(isAdmin) await FixProjetFiles();
    const isDev = isAdmin ? (process.argv[4] === 'dev') : (params3Value === 'dev');
    const pid = md5(`${process.pid}-dyang`);
    BuildConfigInfo(pid);
    const isWin = process.platform == 'win32';
    const prefix = isWin ? 'npx.cmd' : 'npx';    
    let env = process.env;
    let platform = ["PROD"];
    const config = GetProjectConfig();
    env['uuid'] = config.uuid;
    const common = config.common || new Object();
    const currentPath = process.cwd();
    RemoveFolder(path.resolve(`${currentPath}/${common.output || 'dist'}`));
    if(config.env && config.env instanceof Array) platform = [...platform,...config.env];
    env['platform'] = platform.join(',');
    spawn(prefix,['webpack',
    "--config",
    path.resolve(__dirname,`../../webpack/${isDev ? 'dev' : 'prod'}.conf.js`),
    '--progress'],{        
        stdio: 'inherit',
        cwd:path.resolve(__dirname,'../../webpack'),
        env:env
    });
    process.on('exit',function(){
        DeletTempConfigFile(pid);
    });
}

/** 构建Base Axios 入口 */
export function buildAxiosConfig(key:string){
    const config = GetProjectConfig();
    const currentPath = process.cwd();
    const tempPath = path.join(currentPath,`./.temp`);
    const ajaxPath = path.resolve(__dirname,'../../build-files/request.js');
    let ajaxCtx = fs.readFileSync(ajaxPath,'utf-8');
    const common = config.common || new Object();
    const params = [
        {
            value:common.timeout || 15000,
            name:"timeout"
        },
        {
            value:`${currentPath}/src/axios.js`,
            name:"axiosConfig"
        }
    ]
    params.map(v=>{
        const val = v.value;
        const isWin = process.platform === 'win32';
        const value = v.name === 'timeout' ? val : (isWin ? val.replace(/\\/g,"\/").replace(/\:/,":\\") : val);
        ajaxCtx = ajaxCtx.replace(`%%${v.name}%%`,value);
    });
    fs.writeFileSync(path.resolve(`${tempPath}/request.js`),ajaxCtx,'utf-8');
}

/** 构建多页路由配置 */
export function BuildMpaRouterConfig(key:string){
    const config = GetProjectConfig();
    const pagesPath = path.resolve(`${process.cwd()}/${config.common.mainPath}/pages`);
    if(!fs.existsSync(pagesPath)){
        console.log(`Pages Folder Not Found！ path [${pagesPath}]`);
        return;
    }
    const files = fs.readdirSync(pagesPath);
    let routers = new Array();
    files.map(file=>{
        const curPath = pagesPath + "/" + file;
        if(!fs.statSync(curPath).isDirectory()) return;
        const vuePath = `${curPath}/index.vue`;
        if(!fs.existsSync(vuePath)) return;
        const pageConfigPath = `${curPath}/config.json`;
        const hasPageConfig = fs.existsSync(pageConfigPath);
        let routerData:routerItem = {
            path:`/${file}`,
            name:file
        };
        if(hasPageConfig){
            const pageConfigString = fs.readFileSync(pageConfigPath,'utf-8');
            try{
                const pageConfig = JSON.parse(pageConfigString);
                if(pageConfig.path) routerData.path = pageConfig.path;
                if(pageConfig.name) routerData.name = pageConfig.name;
            }catch(error){
                console.log((`Invalid JSON Format,Please Check [${pageConfigPath}]`));
                return;
            }
        }
        routers.push(routerData);
    });
    const currentPath = process.cwd();
    const tempPath = path.join(currentPath,`./.temp`);
    fs.writeFileSync(path.resolve(`${tempPath}/router-config.json`),JSON.stringify(routers,null,'\t'),'utf-8');
    const mainRouterCtx = fs.readFileSync(path.resolve(__dirname,'../../build-files/router.js'),'utf-8');
    fs.writeFileSync(path.resolve(`${tempPath}/routers.js`),mainRouterCtx,'utf-8');
}

/**
 * 修复项目文件
 */
export function FixProjetFiles(){
   const config = GetProjectConfig();
   const uuid = config.uuid;
   const resourcePath = path.resolve(__dirname,`../../.resource/${uuid}`);
   if(fs.existsSync(resourcePath)) {
        console.log('Project files not need to be repaired');
        return;
   }
   fs.mkdirSync(resourcePath,{
       recursive:true
   });
   const packages = config.packages || new Object();
   const keys = Object.keys(packages);
   let packageParams = {
        name: "dyang",
        description: "temp package.json",
        dependencies: {}
    }
    if(keys.length > 0){
        keys.map(v=>{
            packageParams.dependencies[v] = `^${packages[v]}`;
        });
    }
    const resourcePackagePath = path.resolve(`${resourcePath}/package.json`);
    fs.writeFileSync(resourcePackagePath,JSON.stringify(packageParams,null,'\t'),'utf-8');
    if(keys.length <= 0) return Promise.resolve();
    const isWin = process.platform == 'win32';
    const prefix = isWin ? 'npm.cmd' : 'npm';
    return new Promise((resolve,reject)=>{
        const spa = spawn(prefix,['i'],{        
            stdio: 'inherit',
            cwd:resourcePath
        });
        spa.on('exit',()=>{
            resolve();
            console.log('Fix Success');
        });
        process.on('SIGINT', ()=>{
            console.log('Fix Success1');
            reject();
        });
    });
}

const RemoveFolder = (folderPath:string,isMain:boolean = true)=>{
    if(!fs.existsSync(folderPath) || !fs.statSync(folderPath).isDirectory()) {
        return;
    }
    const files = fs.readdirSync(folderPath);
    files.forEach(file=>{
        const curPath = folderPath + "/" + file;
        if(fs.statSync(curPath).isDirectory()) {
            RemoveFolder(curPath,false)
            return;
        };
        fs.unlinkSync(curPath); //删除文件
    });
    fs.rmdirSync(folderPath);
}

export default {
    BuildConfigInfo,
    BuildFileDist,
    DeletTempConfigFile,
    buildMainJs,
    BuildRouterConfig,
    BuildMpaRouterConfig
}