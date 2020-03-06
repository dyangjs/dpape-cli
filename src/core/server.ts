import { BuildConfigInfo, BuildRouterConfig, DeletTempConfigFile, BuildMpaRouterConfig } from './build';
import * as path from 'path';
import * as fs from 'fs';
import { spawn } from 'child_process';
import * as md5 from 'md5';
import { GetProjectConfig } from '../common/utils';
const server = () => {
    console.log('Server Init ...');
    const pid = process.pid;
    const ppid = md5(`${pid}-dyang`)
    BuildConfigInfo(ppid);
    const config = GetProjectConfig();
    console.log('Build Project Config ...');
    const isWin = process.platform == 'win32';
    const prefix = isWin ? 'npx.cmd' : 'npx';
    let env = process.env;
    env['uuid'] = config.uuid;
    let platform = ["DEV"];
    if(config.env && config.env instanceof Array) platform = [...platform,...config.env];
    env['platform'] = platform.join(',');
    spawn(prefix,[
        'webpack-dev-server',
        "--config",
        path.resolve(__dirname,'../../webpack/dev.conf.js'),
        '--progress',
        "--content-base",
        "./dist",
        "--inline"],{        
        stdio: 'inherit',
        cwd:path.resolve(__dirname,'../../webpack'),
        env:env
    });
    /** 监听项目有Pages目录，重新生产Vue路由配置 */
    const currentPath = process.cwd();
    fs.watch(path.resolve(`${currentPath}/src/pages`),{
        recursive:true
    }, function (event, filename) {
        if(filename.indexOf('.vue') < 0 && filename.indexOf('config.json') < 0) return;        
        config.type === 'MPA' ? BuildMpaRouterConfig(ppid) : BuildRouterConfig(ppid);
    });
    /** 删除临时文件 */
    const deletTemp = ()=>{
        DeletTempConfigFile(ppid).then(()=>{
            process.kill(process.pid)
        });
    }
    process.on('SIGINT', deletTemp);
    process.on('exit',deletTemp);
}
export default server;