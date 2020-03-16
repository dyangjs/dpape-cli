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
    let addressInfo:any = os.networkInterfaces().en0;
    if (!addressInfo) addressInfo = os.networkInterfaces();
    const keys = Object.keys(addressInfo);
    const addressKey = keys[0];
    addressInfo = addressInfo[addressKey];
    const ip = addressInfo[1].address
    return ip;
}


export default {
    GetProjectConfig,
    GetCurrentIpAddress
}