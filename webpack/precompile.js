module.exports = function(source) {
    const reg = /(\/\/\#[i|I][f|F])((?!\n\r)\s)(((?!(#[i|I][f|F])).)+)[\r\n](((?!(#[i|I][f|F]))[\s\S])+)[\r\n]((?![\r|\n])\s)*(\/\/\#[i|I][f|F])/g;
    const htmlReg = /(\<\!\-\-\#[i|I][f|F])((?!\n\r)\s)(((?!(#[i|I][f|F])).)+)[\r\n](((?!(#[i|I][f|F]))[\s\S])+)[\r\n]((?![\r|\n])\s)*(\#[i|I][f|F]\-\-\>)/g;
    const platform = process.env.platform || '';
    const platformDatas = platform.split(',');
    source = source.replace(reg, value => {
        const regs = /(\/\/\#[i|I][f|F])((?!\n\r)\s)(((?!(#[i|I][f|F])).)+)[\r\n]/g;
        let platformValue = "";
        value.replace(regs, env => {
            platformValue = env.replace(/\/\/\#[i|I][f|F]/g, '').trim();
            return env;
        });
        if (platformDatas.indexOf(platformValue) >= 0) {
            const regsL = /(\/\/\#[i|I][f|F])((?!\n\r)\s)(((?!(#[i|I][f|F])).)+)[\r\n]/g;
            const regsR = /[\r\n]((?![\r|\n])\s)*(\/\/\#[i|I][f|F])[\r\n]{0,1}/g;
            value = value.replace(regsL, '').replace(regsR, '');
            return value;
        }
        return '';
    });
    source = source.replace(htmlReg, value => {
        const regs = /(\<\!\-\-\#[i|I][f|F])((?!\n\r)\s)(((?!(#[i|I][f|F])).)+)[\r\n]/g;
        let platformValue = "";
        value.replace(regs, env => {
            platformValue = env.replace(/\<\!\-\-\#[i|I][f|F]/g, '').trim();
            return env;
        });
        if (platformDatas.indexOf(platformValue) >= 0) {
            const regsL = /(\<\!\-\-\#[i|I][f|F])((?!\n\r)\s)(((?!(#[i|I][f|F])).)+)[\r\n]/g;
            const regsR = /[\r\n]((?![\r|\n])\s)*(\#[i|I][f|F]\-\-\>)[\r\n]{0,1}/g;
            value = value.replace(regsL, '').replace(regsR, '');
            return value;
        }
        return '';
    });
    return source;
}