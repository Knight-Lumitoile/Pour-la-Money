const express = require("express")
const {upsertTransactionRecord, deleteTransactionRecord, getTransactionRecord} = require("../Services/DataProvider");
const server = express.Router()

server.get("/get", (req, res) => {
    getTransactionRecord()
        .then((e) => res.send(e))
        .catch((error) => res.status(500).send(error))
})

server.post("/upsert", (req, res) => {
    upsertTransactionRecord(req.body)
        .then(() => res.send())
        .catch((error) => res.status(500).send(error))
})

server.post("/delete", (req, res) => {
    deleteTransactionRecord(req.body)
        .then(() => res.send())
        .catch((error) => res.status(500).send(error))
})

module.exports = server