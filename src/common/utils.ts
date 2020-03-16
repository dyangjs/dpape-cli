import * as fs from 'fs';
import * as os from 'os';
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

/**
 * 获取当前局域网Ip地址
 */
export function GetCurrentIpAddress(){
    var networkInterfaces = os.networkInterfaces();
    const ip = networkInterfaces['en0'][1].address;
    return ip;
}


export default {
    GetProjectConfig,
    GetCurrentIpAddress
}