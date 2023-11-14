const express = require("express")
const {initialize} = require("../Services/DataProvider");
const {upsertConfig, getConfig} = require("../Services/ConfigManager");
const server = express.Router()

server.all("/ready", (req, res) => {
    res.send()
})

server.get("/config/db", (req, res) => {
    res.send({
        dbLocation: getConfig("dbLocation") ?? global.path.appRoot,
        dbName: getConfig("dbName")
    })
})

server.post("/config/db", (req, res) => {
    const {dbLocation, dbName} = req.body
    if (dbLocation) upsertConfig("dbLocation", dbLocation)
    if (dbName) upsertConfig("dbName", dbName)
    initialize()
    res.send()
})

module.exports = server