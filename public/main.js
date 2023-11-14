const {app, BrowserWindow, ipcMain} = require('electron')
const isDev = require('electron-is-dev')
const path = require("path");
const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser")
const ip = require("ip");
const {initConfig} = require('./src/Services/ConfigManager');
require('@electron/remote/main').initialize()

function createWindow() {

    initConfig(app.getPath("appData"))

    const server = express()
    server.use(cors())
    server.use(bodyParser.json())
    server.use("/", require("./src/Controllers/BaseController"))
    server.use("/record", require("./src/Controllers/TransactionRecordController"))
    server.use("/type", require("./src/Controllers/TransactionTypeController"))
    server.use("/currency", require("./src/Controllers/CurrencyController"))
    server.use("/config", require("./src/Controllers/ConfigurationController"))
    const host = server.listen(0, () => {
        ipcMain.handle("server-address", () => `http://${ip.address()}:${host.address().port}/`)
    })

    const win = new BrowserWindow({
        width: 1300,
        height: 800,
        minWidth: 1300,
        minHeight: 700,
        autoHideMenuBar: true,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false,
            enableRemoteModule: true
        }
    })
    require('@electron/remote/main').enable(win.webContents)
    win.loadURL(
        isDev
            ? 'http://localhost:3000'
            : `file://${path.join(__dirname, '../build/index.html')}`
    )
    if (isDev) win.webContents.openDevTools({mode: 'detach'})
}


app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') app.quit()
})

app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
})
