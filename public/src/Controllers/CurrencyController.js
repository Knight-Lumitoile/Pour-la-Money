const express = require("express")
const {getCurrency, upsertCurrency, deleteCurrency} = require("../Services/DataProvider");
const server = express.Router()

server.get("/get", (req, res) => {
    getCurrency()
        .then((e) => res.send(e))
        .catch((error) => res.status(500).send(error))
})

server.post("/upsert", (req, res) => {
    upsertCurrency(req.body)
        .then(() => res.send())
        .catch((error) => res.status(500).send(error))
})

server.post("/delete", (req, res) => {
    deleteCurrency(req.body)
        .then(() => res.send())
        .catch((error) => res.status(500).send(error))
})

module.exports = server