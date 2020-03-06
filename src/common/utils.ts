import * as fs from 'fs';
/** 获取项目配置信息 */
export function GetProjectConfig(){
    const currentPath = process.cwd();
    const configFilePath = `${currentPath}/dyang.config.json`;
    if(!fs.existsSync(configFilePath)){
        const message = `Config File Not Exist, Path [${configFilePath}]`;
        throw Error(message);
    }
    const config = fs.readFileSync(configFilePath,'utf-8');
    try{
        const result = JSON.parse(config);
        return result;
    }catch(error){
        throw Error(`Invalid JSON Format,Please Check [${configFilePath}]`);
    }
}

export default {
    GetProjectConfig
}