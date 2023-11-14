const {DataType} = require("../Database");

class Currency {
    name
    code
    rate
    isPrimary

    _name = {type: DataType.TEXT}
    _code = {type: DataType.TEXT, primaryKey: true}
    _rate = {type: DataType.NUMBER}
    _isPrimary = {type: DataType.NUMBER}

    constructor(name, code, rate, isPrimary) {
        this.name = name
        this.code = code
        this.rate = rate
        this.isPrimary = isPrimary
    }
}

module.exports = Currency