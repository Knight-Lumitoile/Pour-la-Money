const {Database} = require("../Database")
const TransactionRecord = require("../Models/TransactionRecord");
const TransactionType = require("../Models/TransactionType");
const Currency = require("../Models/Currency");
const Configuration = require("../Models/Configuration");
const path = require('path')
const {getConfig, upsertConfig} = require("./ConfigManager");
const fs = require("fs");

const db = new Database()

const initialize = () => {

    let dbPath = getConfig("dbLocation")
    if (!fs.existsSync(dbPath)) {
        upsertConfig("dbLocation", global.path.appRoot)
        dbPath = global.path.appRoot
    }
    dbPath = path.join(dbPath, `${getConfig("dbName")}.db`)
    db.refresh()
    db.register(TransactionRecord)
    db.register(TransactionType)
    db.register(Currency)
    db.register(Configuration)
    console.log(dbPath)
    db.sync(dbPath)
}

initialize()

const getTransactionRecord = (condition, conditonParam) => {
    return new Promise((resolve, reject) => {
        try {
            db.get('TransactionRecord', condition, conditonParam).then(resolve)
        } catch (error) {
            reject(error)
        }
    })
}

const upsertTransactionRecord = (items) => {
    return new Promise(async (resolve, reject) => {
        try {
            const newItems = []
            if (!Array.isArray(items)) items = [items]
            for (const item of items) {
                const newItem = Object.assign(new TransactionRecord(), item)
                if (newItem.type)
                    newItem.type = Object.assign(new TransactionType(), newItem.type)
                if (newItem.currency)
                    newItem.currency = Object.assign(new Currency(), newItem.currency)
                newItems.push(newItem)
            }
            console.log(newItems)
            await db.upsert(newItems)
            resolve(true)
        } catch (error) {
            console.log(error)
            reject(error)
        }
    })
}

const deleteTransactionRecord = (keys) => {
    return new Promise((resolve, reject) => {
        try {
            db.delete('TransactionRecord', 'key', keys)
            resolve(true)
        } catch (error) {
            reject(error)
        }
    })
}

const getTransactionType = (condition, conditonParam) => {
    return new Promise((resolve, reject) => {
        try {
            db.get('TransactionType', condition, conditonParam).then(resolve)
        } catch (error) {
            reject(error)
        }
    })
}

const upsertTransactionType = (items) => {
    return new Promise(async (resolve, reject) => {
        try {
            const newItems = []
            if (!Array.isArray(items)) items = [items]
            for (const item of items) {
                const newItem = Object.assign(new TransactionType(), item)
                newItems.push(newItem)
            }
            await db.upsert(newItems)
            resolve(true)
        } catch (error) {
            reject(error)
        }
    })
}

const deleteTransactionType = (keys) => {
    return new Promise((resolve, reject) => {
        try {
            db.delete('TransactionType', 'key', keys)
            resolve(true)
        } catch (error) {
            reject(error)
        }
    })
}

const getCurrency = (condition, conditonParam) => {
    return new Promise((resolve, reject) => {
        try {
            db.get('Currency', condition, conditonParam).then(resolve)
        } catch (error) {
            reject(error)
        }
    })
}

const upsertCurrency = (items) => {
    return new Promise(async (resolve, reject) => {
        try {
            const newItems = []
            if (!Array.isArray(items)) items = [items]
            for (const item of items) {
                const newItem = Object.assign(new Currency(), item)
                newItems.push(newItem)
            }
            db.execute("DELETE FROM Currency", [])
            await db.upsert(newItems)
            resolve(true)
        } catch (error) {
            reject(error)
        }
    })
}

const deleteCurrency = (keys) => {
    return new Promise((resolve, reject) => {
        try {
            db.delete('Currency', 'code', keys)
            resolve(true)
        } catch (error) {
            reject(error)
        }
    })
}

const getConfigurations = (condition, conditonParam) => {
    return new Promise((resolve, reject) => {
        try {
            db.get('Configuration', condition, conditonParam).then(resolve)
        } catch (error) {
            reject(error)
        }
    })
}

const upsertConfigurations = (items) => {
    return new Promise(async (resolve, reject) => {
        try {
            const newItems = []
            if (!Array.isArray(items)) items = [items]
            for (const item of items) {
                const newItem = Object.assign(new Configuration(), item)
                newItems.push(newItem)
            }
            await db.upsert(newItems)
            resolve(true)
        } catch (error) {
            reject(error)
        }
    })
}

const sqlSelect = (query, values) => {
    return new Promise((resolve, reject) => {
        try {
            resolve(db.select(query, values))
        } catch (error) {
            reject(error)
        }
    })
}

const sqlExecute = (query, values) => {
    return new Promise((resolve, reject) => {
        try {
            db.execute(query, values)
            resolve(true)
        } catch (error) {
            reject(error)
        }
    })
}


module.exports = {
    initialize,
    getTransactionRecord,
    upsertTransactionRecord,
    deleteTransactionRecord,
    getTransactionType,
    upsertTransactionType,
    deleteTransactionType,
    getCurrency,
    upsertCurrency,
    deleteCurrency,
    getConfigurations,
    upsertConfigurations,
    sqlSelect,
    sqlExecute
}

