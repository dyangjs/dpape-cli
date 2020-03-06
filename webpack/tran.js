module.exports = function(source) {
    const reg = new RegExp('\\<\\%((?![\\>|\\%|\\<]).)*\\%\\>', 'g');
    source = source.replace(reg, value => {
        const regsL = new RegExp('\\<\\%', 'g');
        const regsR = new RegExp('\\%\\>', 'g');
        value = value.replace(regsL, "").replace(regsR, "");
        return value.trim();
    });
    return source;
}