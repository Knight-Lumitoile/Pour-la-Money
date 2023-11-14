const {DataType} = require("../Database");

class TransactionType {
    key
    name
    color
    icon

    _key = {type: DataType.TEXT, primaryKey: true}
    _name = {type: DataType.TEXT}
    _icon = {type: DataType.TEXT}
    _color = {type: DataType.TEXT}

    constructor(key, name, icon, color) {
        this.key = key
        this.name = name
        this.icon = icon
        this.color = color
    }
}

module.exports = TransactionType