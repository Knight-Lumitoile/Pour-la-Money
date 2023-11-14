const fs = require('fs');
const path = require('path')
const defaultConfig = require('../config.json')
const appConfig = require("../app.json")

function initConfig(strPath) {

    const strAppPath = path.join(strPath, appConfig.appName)
    global.path = {
        appRoot: strAppPath,
        appConfig: path.join(strAppPath, "app.config")
    }

    if (!fs.existsSync(global.path.appRoot)) fs.mkdirSync(global.path.appRoot)

    if (!fs.existsSync(global.path.appConfig)) {
        fs.writeFileSync(global.path.appConfig, JSON.stringify(defaultConfig, undefined, 2));
    }
}

function getConfig(key) {
    try {
        const configData = fs.readFileSync(global.path.appConfig);
        const config = JSON.parse(configData);
        const value = config[key];
        console.log(config)
        if (value === "") {
            return undefined
        } else {
            return config[key];
        }
    } catch (error) {
        return undefined;
    }
}

function upsertConfig(key, value) {
    try {
        const configData = fs.readFileSync(global.path.appConfig);
        const config = JSON.parse(configData);
        config[key] = value;
        fs.writeFileSync(global.path.appConfig, JSON.stringify(config));
    } catch (error) {
        console.error(error);
    }
}

module.exports = {
    initConfig,
    getConfig,
    upsertConfig
}