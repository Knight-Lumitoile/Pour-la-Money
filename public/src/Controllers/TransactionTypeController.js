const express = require("express")
const {getTransactionType, upsertTransactionType, deleteTransactionType} = require("../Services/DataProvider");
const server = express.Router()

server.get("/get", (req, res) => {
    getTransactionType()
        .then((e) => res.send(e))
        .catch((error) => res.status(500).send(error))
})

server.post("/upsert", (req, res) => {
    upsertTransactionType(req.body)
        .then(() => res.send())
        .catch((error) => res.status(500).send(error))
})

server.post("/delete", (req, res) => {
    deleteTransactionType(req.body)
        .then(() => res.send())
        .catch((error) => res.status(500).send(error))
})

module.exports = server