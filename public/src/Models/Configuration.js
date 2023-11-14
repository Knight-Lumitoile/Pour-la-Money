const {DataType} = require("../Database");

class Configuration {
    key
    value

    _key = {type: DataType.TEXT, primaryKey: true}
    _value = {type: DataType.TEXT}

    constructor(key, value) {
        this.key = key
        this.value = value
    }
}

module.exports = Configuration