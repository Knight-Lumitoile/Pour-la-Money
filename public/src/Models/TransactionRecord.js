const {DataType} = require("../Database");

class TransactionRecord {
    key
    entity
    isExpense
    type
    date
    currency
    amount
    details

    _key = {type: DataType.TEXT, primaryKey: true}
    _entity = {type: DataType.TEXT}
    _isExpense = {type: DataType.NUMBER}
    _type = {type: DataType.OBJECT, target: "TransactionType", via: "key"}
    _date = {type: DataType.TEXT}
    _currency = {type: DataType.OBJECT, target: "Currency", via: "code"}
    _amount = {type: DataType.NUMBER}
    _details = {type: DataType.TEXT}

    constructor(key, entity, isExpense, type, date, amount, details) {
        this.key = key
        this.entity = entity
        this.isExpense = isExpense
        this.type = type
        this.date = date
        this.amount = amount
        this.details = details
    }
}

module.exports = TransactionRecord