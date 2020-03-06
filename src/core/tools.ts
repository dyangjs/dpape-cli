
import { GetProjectConfig } from '../common/utils';
import { spawn } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';
import * as xlsx from 'node-xlsx';
import * as http from 'http';
import * as md5 from 'md5';
import * as querystring from 'querystring';
import { Interface } from 'readline';
/** 包资源白名单 */
export enum whitelistData {
    "vant",
    "element-ui",
    "view-design",
    "vue-dyangui"
}

export enum LangList {
    "zh",
    "en",
    "tw"
}

/** 更新配置版本 */
const updateConfigVersion = (uuid:string)=>{
    let config = GetProjectConfig();    
    if(config.uuid !== uuid) return;
    const packageCtx = fs.readFileSync(path.resolve(__dirname,`../../.resource/${uuid}/package.json`),'utf-8');
    let packageJson:{
        name?:string
        description?:string
        dependencies?:string
    } = new Object();
    try{
        packageJson = JSON.parse(packageCtx);
        packageJson = packageJson.dependencies || new Object();
    }catch(error){
        throw Error(error);
    }
    config.packages = typeof config.packages !== 'object'? new Object() : config.packages;
    for (const name in packageJson) {
        if (!packageJson.hasOwnProperty(name)) continue;
        const version:string = packageJson[name];   
        config.packages[name] = version.replace('^','');
    }
    const currentPath = process.cwd();
    const configPath = path.resolve(`${currentPath}/dyang.config.json`);
    fs.writeFileSync(configPath,JSON.stringify(config,null,'\t'),'utf-8');
}

/** 开始安装 */
const startInstall = (uuid:string,packageName:string)=>{  
    const isWin = process.platform == 'win32';
    const prefix = isWin ? 'npm.cmd' : 'npm';
    /** 安装包资源 */
    const cmd = spawn(prefix,['i',packageName,'-S'],{
        cwd:path.resolve(__dirname,`../../.resource/${uuid}`),   
        stdio: 'inherit'
    });
    /** 安装完成退出 */
    cmd.on('exit',()=>{
        updateConfigVersion(uuid);
        console.log('Install Done');
    });
    /** 安装失败退出 */
    cmd.on('error',()=>{
        console.log('Install Fila');
    })
    /** 用户强制退出 */
    process.on('SIGINT', ()=>{
        console.log('Install Fail');
        process.kill(process.pid)
    });
}

/** 安装开发依赖资源 */
export function Install(){
    const config = GetProjectConfig();
    const uuid = config.uuid;
    const packageName:string | undefined = process.argv[3];
    if(packageName){
        const value = packageName.split('@');
        const name = value[0];        
        if(whitelistData[name] === undefined) {
            console.log(`Package Whitelist Not Found The Package [${name}]. You can view the whitelist for -w`);
            return;
        }
        if(!uuid) {
            console.log('Project UUID Not Found in Config File, Please Check');
            return;
        }      
        startInstall(uuid,packageName);
        return;
    }
    /** 获取项目配置安装 */
    const packages = config.packages;
    if(!packages || typeof packages !== 'object') {
        console.log('Not Found Package Config, Please Check');
        return;
    }
    let packagesList = "";
    for (const name in packages) {
        if (!packages.hasOwnProperty(name) || whitelistData[name] === undefined) continue;        
        const version = packages[name];
        if(whitelistData[name] === undefined) {
            console.log(`Package Whitelist Not Found The Package [${name}]. You can view the whitelist for -w`);
            continue;
        }
        packagesList += `${name}@${version} `
    }
    startInstall(uuid,packagesList);
}

/** 获取资源文件翻译文本信息 */
const GetResourceTranslateText = (srcPath:string) => {
    const reg = new RegExp('\\<\\%((?![\\>|\\%|\\<]).)*\\%\\>','g');
    if(!fs.statSync(srcPath).isDirectory()) return;
    const files = fs.readdirSync(srcPath);
    let result = new Array();
    files.forEach(file=>{
        const curPath = srcPath + "/" + file;
        if(fs.statSync(curPath).isDirectory()) {
            const ctxResult = GetResourceTranslateText(curPath);
            if(ctxResult) result = [...result,...ctxResult];
            return;
        };
        const ctx = fs.readFileSync(curPath,'utf-8');
        ctx.replace(reg,value=>{
            const regsL = new RegExp('\\<\\%','g');
            const regsR = new RegExp('\\%\\>','g');
            value = value.replace(regsL,"").replace(regsR,"");
            result.push(value.trim());
            return value;
        });
    });
    let list = new Set(result);
    let listResult = Array.from(list);
    return listResult;
}

interface langDataItem {
    lang:LangList,
    value:Array<{
        src:string
        dst:string
    }>
}

/** 写文件 */
const writeTranslate = (savePath:string,translateList:Array<string>,langDatas?:langDataItem | Array<langDataItem> | null)=>{
    const baseDatas = {
        name: 'sheet1',
        data:new Array()
    };
    let datas = [['key','zh','en',"tw"]];
    let langParams = new Object();
    if(langDatas && !(langDatas instanceof Array)){
        const paramDatas = Object();
        langDatas.value.map(v=>{
            paramDatas[v.src] = v;
        });
        langParams[langDatas.lang] = paramDatas;
    }else if(langDatas){
        langDatas.map(v=>{
            const paramDatas = Object();
            v.value.map(v=>{
                paramDatas[v.src] = v;
            });
            langParams[v.lang] = paramDatas;
        });
    }
    translateList.map(v=>{
        let en_result = langParams[LangList.en];
        let tw_result = langParams[LangList.tw];
        let en_value = "";
        let tw_value = "";
        if(en_result) en_value = (en_result[v] || new Object()).dst || '';
        if(tw_result) tw_value = (tw_result[v] || new Object()).dst || '';
        datas.push(
            [v,v,en_value,tw_value]
        );
    });
    baseDatas.data = datas;
    var buffer = xlsx.build([baseDatas]);
    // 写入文件
    const translatePath = path.resolve(`${savePath}/translate.xlsx`);
    if(fs.existsSync(translatePath)){
        fs.unlinkSync(translatePath);
    }
    fs.writeFile(translatePath, buffer, err => {
        if (err) throw Error(JSON.stringify(err));
        console.log(`Translate Export Success. Please Check File [${translatePath}]`);
    });
}

/** 导出项目<% example %> xls*/
export function ExportTranslate(){
    const config = GetProjectConfig();
    const mainPath = (config.common || new Object()).mainPath || 'src';
    const currentPath = process.cwd();
    const translateList = GetResourceTranslateText(path.resolve(`${currentPath}/${mainPath}`));
    if(!translateList || translateList.length <= 0) {
        console.log('No match to character');
        return;
    }    
    const isAuto = Boolean(process.argv[3] && process.argv[3] === 'auto');
    if(!isAuto) {
        writeTranslate(currentPath,translateList);
        return;
    }    
    const query = translateList.join("\n");
    getTranslateResult(query,[LangList.tw,LangList.en]).then(result=>{
        writeTranslate(currentPath,translateList,result);
    }).catch(error=>{
        console.log(error);
    })
    
}

/** 获取语言列表数据 */
const getTranslateResult = async (query:string,lang:Array<LangList>)=>{
    let langArr:Array<langDataItem> = new Array();
    await Promise.all(lang.map(async v => {
        const tran:any = await asyncRequest(query,LangList[v]);        
        langArr.push({
            lang:v,
            value:tran
        });
    }));
    return langArr;
}

/** 获取Api翻译结果 */
const asyncRequest = (query:string,lang:string)=>{
    return new Promise((resolve,reject)=>{        
        const from = 'zh';
        const to = lang === 'tw' ? 'cht' : lang;
        const appid = "20191016000341825";
        const salt = (new Date).getTime();
        const srcMD5 = `${appid}${query}${salt}${'7LwHZatBaQdLPL7BArQ_'}`;
        const sign = md5(srcMD5);  
        const params = {
            q: query,
            appid: appid,
            salt: salt,
            from: from,
            to: to,
            sign: sign
        };
        const postData = querystring.stringify(params);
        var ajax = http.request({
            path: `/api/trans/vip/translate`,
            host: 'api.fanyi.baidu.com',
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Content-Length': Buffer.byteLength(postData)
            }
        },res=>{        
            if (res.statusCode == 200) {
                res.setEncoding("utf-8");
                var resData = "";
                res.on("data", function(chunk) {
                    resData += chunk;
                }).on("end", function() {
                    const jsonResult = JSON.parse(resData);
                    const result:Array<{
                        src:string
                        dst:string
                    }> = jsonResult['trans_result'];
                    resolve(result);
                });
            } else {
                reject(res.statusCode);                
            }
        });
        ajax.write(postData);
        ajax.end();
    });
}

export default {
    Install,
    ExportTranslate
}