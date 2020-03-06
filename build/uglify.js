var fs = require('fs');
var path = require('path');
var UglifyJS = require("uglify-js");
const build = (cPath)=>{
    const folderPath = cPath ? cPath : path.resolve(__dirname, '../dist');
    const files = fs.readdirSync(folderPath);
    files.forEach((file, i) => {
        const curPath = folderPath + "/" + file;
        if (fs.statSync(curPath).isDirectory()) {
            build(curPath);
            return;
        };
        if (file.indexOf('.js') < 0) return;
        var code = fs.readFileSync(curPath, 'utf-8');
        var result = UglifyJS.minify(code);
        fs.writeFileSync(curPath, result.code, 'utf-8');
        if (i == files.length - 1 && !cPath) console.log('Build Success');
    });
}
console.log("JS Code Zip in ....");
build();