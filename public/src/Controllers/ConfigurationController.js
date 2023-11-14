const express = require("express")
const {getConfigurations, upsertConfigurations} = require("../Services/DataProvider");
const server = express.Router()

server.get("/get", (req, res) => {
    getConfigurations()
        .then((e) => res.send(e))
        .catch((error) => res.status(500).send(error))
})

server.post("/upsert", (req, res) => {
    upsertConfigurations(req.body)
        .then(() => res.send())
        .catch((error) => res.status(500).send(error))
})

module.exports = server