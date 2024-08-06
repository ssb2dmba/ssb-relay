
const path = require('node:path')
const os = require('node:os')
const fs = require('node:fs')

module.exports = async function (globalConfig, projectConfig) {
    
    let dir = path.join(os.homedir(),".ssb")
    if (!fs.existsSync(dir)){
        fs.mkdirSync(dir);
    }

    let secretPath = path.join(os.homedir(),".ssb", "secret");
    if (!fs.existsSync(secretPath)) {
        fs.closeSync(fs.openSync(secretPath, 'w'));
    }
    
}

