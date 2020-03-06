import * as fs from 'fs';
import * as path from 'path';
import projectFileConfig from '../base/project';
import * as md5 from 'md5';
interface buildProjectConfig{
    /** 项目名称 */
    appName:string
    /** 项目类型 SPA OR MPA */
    projectType:string
    /** 主目录文件名称 */
    mainPath:string
    /** 是否创建维护页面 */
    promptMaintain:boolean
    /** 是否创建404页面 */
    prompt404:boolean
    /** 是否创建服务器器异常页面 */
    promptError:boolean
}

/** 创建404 Not found、Server Error页面 */
const CreatePromptFiles = (type:"MPA" | "SPA",pagesPath:string,lists:Array<any> = new Array())=>{
    const basePath = path.resolve(__dirname,'../../build-files/prompt');
    /** 创建文件夹 */
    lists.map(v=>{
        const promptPath = path.resolve(`${pagesPath}/${v}`);
        fs.mkdirSync(promptPath,{
            recursive:true
        });
        const vueCtx = fs.readFileSync(path.resolve(`${basePath}/${v}.vue`),'utf-8');
        const scssCtx = fs.readFileSync(path.resolve(`${basePath}/${v}.scss`),'utf-8');
        fs.writeFileSync(path.resolve(`${promptPath}/index.vue`),vueCtx,'utf-8');
        fs.writeFileSync(path.resolve(`${promptPath}/index.scss`),scssCtx,'utf-8');
        if(type === 'MPA') {
            const pageMainJs = fs.readFileSync(path.resolve(__dirname,'../../build-files/mpa/index.js'),'utf-8');
            fs.writeFileSync(path.resolve(`${promptPath}/index.js`),pageMainJs,'utf-8');
        }
    });
}

/**
 * 构建项目目录
 */
export async function createProjectJsonFile(mainEntryPath:string,config?:buildProjectConfig){
    if(!fs.existsSync(mainEntryPath)){
        throw Error('Main Entry Ptah Is Not Exists');
    }
    console.log('Create Project Files, Please waiting...');
    const data:any = config === undefined ? new Object() : config;
    /** 项目代码入口 */
    const mainPath = data.mainPath || "src";
    /** 代码资源文件路径 */
    const srcPath = `${mainEntryPath}/${mainPath}`;
    fs.mkdirSync(srcPath,{
        recursive:true
    });
    const datetime = new Date().getTime();
    let uuid = `${datetime}-${data.appName || ''}`;    
    uuid = md5(uuid);
    const projectType = data.projectType || 'SPA';
    let defaultConfig = {
        uuid:uuid,
        env:["APP","H5"],
        devServerHost:"127.0.0.1",
        devServerPort:"8080",
        hasNotFoundPage:false,
        type:data.projectType || 'SPA',
        dev:{
            BASE_API:"'http://example.com'",
            DOWNLOAD_PATH:"'resource'",
            VERSION:"'1.0.0.0'"
        },
        prod:{
            BASE_API:"'https://example.com'",
            downloadPath:"'resource'",
            VERSION:"'1.0.0.0'"
        },
        common:{
            mainPath:mainPath,
            alias:{
                '@api': "api",
                '@assets': "assets",
                '@pages': "pages",
                '@css': "css"
            },
            appName:data.appName || '',
            timeout:15000,
            output:"dist",
            mainRouter:"home",
            elementId:"#app"
        }
    };
    let createFileNames = ["pages","assets","api","css","filter.js","axios.js"];   
    if(projectType === 'SPA'){
        const spanFils = ["store.js",'main.vue'];
        createFileNames = [...createFileNames,...spanFils];
    }
    if(projectType === 'MPA'){
        projectFileConfig['filter'] = fs.readFileSync(path.resolve(__dirname,'../../build-files/mpa/filter.js'),'utf-8');
    }
    createFileNames.map(v=>{
        if(v.indexOf('.') >=0) {
            const name = v.split('.')[0] || '';
            const ctx = projectFileConfig[name] || '';
            fs.writeFileSync(`${srcPath}/${v}`,ctx,'utf-8');
            console.log(`Create File ${v} Suceess`);
            /** 文件 */
            return;
        }
        fs.mkdirSync(`${srcPath}/${v}`,{
            recursive:true
        });
        console.log(`Create Folder ${v} Suceess`);
        /** 创建文件夹 */
    });
    createdHomePage(projectType,`${srcPath}/pages`);
    /** 构建公共样式文件 */
    fs.writeFileSync(`${srcPath}/css/formula.scss`,`
$f: 100;
@function f($px) {
    @return $px / $f * 1rem;
}
    `,'utf-8');

    console.log(`Create File /css/formula.scss Suceess`);
    fs.writeFileSync(`${srcPath}/css/main.scss`,`
body,
p,
ul,
div,
li {
    padding: 0;
    margin: 0;
}

* {
    box-sizing: border-box;
}

/** 省略号*/

.omit {
    overflow: hidden;
    text-overflow: ellipsis;
    padding-right: f(5);
    white-space: nowrap;
    width: 100%;
    display: inline-block;
}
    `,'utf-8');
    console.log(`Create File /css/main.scss Suceess`);
    /** 构建Api示例文件 */
    const ExampleApiPath = `${srcPath}/api/common.js`;
    const ExampleApiCtx = `
export async function Example() {
    // const result = await "请求代码";
    // return result.data;
}
export default {
    Example
}
    `;
    fs.writeFileSync(ExampleApiPath,ExampleApiCtx,'utf-8');
    console.log(`Create File /api/common.js Suceess`);
    /** 构建写入项目配置文件 */
    let promptList = new Array();
    if(config && config.promptMaintain) promptList.push('maintain');
    if(config && config.prompt404) promptList.push('404');
    if(config && config.promptError) promptList.push('error');
    CreatePromptFiles(projectType,`${srcPath}/pages`,promptList);
    defaultConfig.hasNotFoundPage = Boolean(config && config.prompt404);
    fs.writeFileSync(`${mainEntryPath}/dyang.config.json`,JSON.stringify(defaultConfig,null,'\t'),'utf-8');    
    console.log(`Create File dyang.config.json Suceess`);   
    /** 创建当前Project package.json */
    const resourcePath =  path.resolve(__dirname,`../../.resource`);
    if(!fs.existsSync(resourcePath)){
        fs.mkdirSync(resourcePath,{
            recursive:true
        });
    }
    const projectResourcePath = path.resolve(`${resourcePath}/${uuid}`);
    fs.mkdirSync(projectResourcePath,{
        recursive:true
    });
    let packageJson = {
        name:data.appName || '',
        description: "temp package.json",
        dependencies:new Object()
    }
    fs.writeFileSync(path.resolve(`${projectResourcePath}/package.json`),JSON.stringify(packageJson,null,'\t'),'utf-8');
    if(projectType === 'SPA'){
        fs.writeFileSync(`${srcPath}/components.js`,`
import Vue from 'vue';
import { Button } from 'vue-dyangui';
Vue.use(Button);
        `,'utf-8');
        console.log(`Create File components.js Suceess`);
    }
    CreateProjectPackage(mainEntryPath);
    console.log('Created Success');
    return Promise.resolve();
}

/** 创建示例页面Home Page */
export function createdHomePage(type:'MPA' | 'SPA',pagesPath:string){
    if(!pagesPath){
        console.log(`Illegal Resources Path！`);
        return;
    }
    if(!fs.existsSync(pagesPath)){
        console.log(`Illegal Resources Path！[${pagesPath}]`);
        return;
    }
    const name = type === 'MPA' ? 'index' : 'home';
    const mainPath = path.resolve(`${pagesPath}/${name}`);
    fs.mkdirSync(mainPath,{
        recursive:true
    });
    /** 示例页面.vue文件代码 */
    const html = `
<template>
    <div class="home">
        <h3>Welcome Use</h3>
        <p>{{message}}</p>
    </div>
</template>
<script>
import './index.scss';
export default {
    data(){
        return {
            message:'dyang CLI'
        }
    }
}
</script>`;
    const cssCtx = `
.home{
    padding:0;
    display: flex;
    width: 100%;
    height: 100%;
    justify-content: center;
    align-items: center;
    position: fixed;
    text-align: center;
    flex-flow: column;
}`;
    const pageMainJs = fs.readFileSync(path.resolve(__dirname,'../../build-files/mpa/index.js'),'utf-8');
    let writeFiles = [
        {
            name:"index.vue",
            value:html
        },
        {
            name:"index.scss",
            value:cssCtx
        }
    ];   
    if(type === 'MPA'){
        writeFiles.push({
            name:"index.js",
            value:pageMainJs
        });
    }
    writeFiles.map(v=>{
        const filePath = path.resolve(`${mainPath}/${v.name}`);
        fs.writeFileSync(filePath,v.value,'utf-8');
    });
}

const CreateProjectPackage = (mainPath:string)=>{
    if(!mainPath || !fs.existsSync(mainPath)) return;
    const jsonData = {
        name: "dyang-cli",
        scripts:{
            build:"dyang -b",
            dev:"dyang -s",
            'build-dev':"dyang -b admin dev"
        }
    };
    fs.writeFileSync(path.resolve(`${mainPath}/package.json`),JSON.stringify(jsonData,null,'\t'),'utf-8');
}

export default {
    createProjectJsonFile
}