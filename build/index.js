var { spawn } = require('child_process');
var fs = require('fs');
var path = require('path');
var spin = require('io-spin');
var spinner = spin('TS Builds JS Code in ...');
spinner.start();
/** 删除配置文件 */
function build(cPath) {
    const FolderPath = cPath ? cPath : path.resolve(__dirname, '../dist');
    if (fs.existsSync(FolderPath)) {
        const files = fs.readdirSync(FolderPath);
        files.forEach(file => {
            const curPath = FolderPath + "/" + file;
            if (fs.statSync(curPath).isDirectory()) {
                build(curPath);
                return;
            };
            fs.unlinkSync(curPath); //删除文件
        });
        fs.rmdirSync(FolderPath);
    }
    const isWin = process.platform == 'win32';
    const prefix = isWin ? 'tsc.cmd' : 'tsc';
    spawn(prefix, []);
}
build();
spinner.stop();
console.log('TS Builds JS Code in ...');