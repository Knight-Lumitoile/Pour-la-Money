const DataType = {
    TEXT: "TEXT",
    NUMBER: "NUMBER",
    OBJECT: "OBJECT",
    LIST: "LIST"
}

class Database {

    db
    rootPath
    entities = []

    constructor() {

    }

    refresh = () => {
        this.entities = []
    }

    // Register entity class.
    register = (classDefinition) => {
        const classInstance = new classDefinition()
        this.entities.push({
            new: (...args) => new classDefinition(...args),
            className: classDefinition.name,
            properties: Object.keys(classInstance)
                .filter((key) => key.startsWith("_"))
                .map((key) => ({name: key.substring(1), ...(classInstance[key])}))
        })
    }

    // Create tables for registered entities.
    sync = (dbPath, forceUpdate = false) => {

        this.db = require('better-sqlite3')(dbPath)
        this.db.pragma("foreign_keys = off")

        const createTableScript = this.entities.map((entity) => {
            const tableName = entity.className
            const properties = entity.properties
            const primaryKeys = []
            const foreignKeys = []
            let createTableScript = `${forceUpdate ? `DROP TABLE IF EXISTS ${tableName};` : ""} CREATE TABLE IF NOT EXISTS ${tableName} (`
            let extraTableScript = ''
            properties.forEach((property) => {
                let propertyName = property.name
                let propertyType = property.type ?? "TEXT"
                if (propertyType === DataType.LIST) {
                    const target = property.target
                    const targetPk = properties.find((pt) => pt.name = property.pk)
                    const targetVia = this.entities.find(et => et.className === target).properties.find((pt) => pt.name === property.via)
                    extraTableScript += `${forceUpdate ? `DROP TABLE IF EXISTS ${tableName}_${target};` : ""} CREATE TABLE IF NOT EXISTS ${tableName}_${target} (${tableName}_${property.pk} ${targetPk.type ?? "TEXT"}, ${target}_${property.via} ${targetVia.type ?? "TEXT"}, FOREIGN KEY(${tableName}_${property.pk}) REFERENCES ${tableName}(${property.pk}), FOREIGN KEY(${target}_${property.via}) REFERENCES ${target}(${property.via}), PRIMARY KEY(${tableName}_${property.pk}, ${target}_${property.via}));`
                } else {
                    if (propertyType === DataType.OBJECT) {
                        foreignKeys.push(`FOREIGN KEY(${propertyName}) REFERENCES ${property.target}(${property.via})`)
                        propertyType = DataType.TEXT
                    }
                    if (property.primaryKey) primaryKeys.push(propertyName)
                    createTableScript += `${propertyName} ${propertyType}, `
                }
            })
            createTableScript += `PRIMARY KEY (${primaryKeys.join(", ")})`
            if (foreignKeys.length > 0) createTableScript += `, ${foreignKeys.join(",")}`
            createTableScript += ");" + extraTableScript
            return createTableScript
        }).join("")

        this.db.exec(`${createTableScript}`)
    }

    // INSERT or UPDATE registered entities. Child object will be nested `upsert()` as well.
    upsert = async (data) => {
        // Input data should be a List.
        if (data.constructor.name !== "Array") data = [data];
        // Find registered entity by className from first object.
        // We assume that input data have the same type.
        const entityClass = this.entities.find((ent) => ent.className === data[0].constructor.name);
        // If object is registered entity
        if (entityClass) {
            // Get entity properties that are not List (M-N Relationship)
            const simpleProperties = entityClass.properties.filter((ppt) => ppt.type !== DataType.LIST);

            // Prepare the update query by non-list properties
            const updateQuery = this.db.prepare(
                `INSERT OR REPLACE INTO ${entityClass.className} (${simpleProperties
                    .map((prop) => `${prop.name}`)
                    .join(", ")}) VALUES (${simpleProperties.map((prop) => `@${prop.name}`).join(", ")})`
            );

            // An array to hold all the promises for upsert and insert operations
            const promises = [];

            // Loop through input data
            for (const obj of data) {
                // Loop through non-list properties
                const values = simpleProperties.map((prop) => {
                    // Default key value pairs
                    let key = prop.name;
                    let value = obj[prop.name];

                    // 1-N relationship
                    if (prop.type === DataType.OBJECT && value !== undefined) {
                        // Upsert the target object and add the returned promise to the array
                        promises.push(this.upsert(value));
                        // Store the foreign key
                        value = value[prop.via];
                    }

                    return [key, value];
                });

                console.log(values)
                // Execute script
                updateQuery.run(Object.fromEntries(values))

                // Loop through M-N relationships
                for (const prop of entityClass.properties.filter((props) => props.type === DataType.LIST)) {
                    // Upsert the target object list and add the returned promise to the array
                    const value = obj[prop.name];
                    promises.push(this.upsert(value));

                    // Insert relationships
                    const target = prop.target;
                    const insertQuery = this.db.prepare(
                        `INSERT OR REPLACE INTO ${entityClass.className}_${target} (${entityClass.className}_${prop.pk}, ${target}_${prop.via}) VALUES (?, ?)`
                    );

                    // Add the returned promises to the array
                    for (const targetObj of value) {
                        promises.push(insertQuery.run(obj[prop.pk], targetObj[prop.via]));
                    }
                }
            }

            // Wait for all promises to resolve and then return
            await Promise.all(promises);
        }
    }


    select = (query, values) => {
        return this.db.prepare(query).all(values)
    }

    execute = (query, values) => {
        this.db.prepare(query).run(values)
    }

    delete = (table, column, values) => {
        const entityClass = this.entities.find(ett => ett.className === table)
        this.db.prepare(`DELETE FROM ${entityClass.className} WHERE ${column} = ?`).run(values)
    }

    get = async (table, condition, conditionParam) => {
        const entityClass = this.entities.find((ett) => ett.className === table);
        let res

        if (condition) {
            res = this.db.prepare(`SELECT * FROM ${entityClass.className} ${condition}`).all(conditionParam);
        } else {
            res = this.db.prepare(`SELECT * FROM ${entityClass.className}`).all();
        }

        const resultPromises = res.map(async (row) => {
            let inst = entityClass.new();

            for (let j = 0; j < entityClass.properties.length; j++) {
                let prop = entityClass.properties[j];

                if (prop.type === DataType.LIST) {
                    const target = prop.target;
                    if (row[prop.pk] !== null)
                        inst[prop.name] = await this.get(
                            prop.target,
                            `JOIN ${entityClass.className}_${target} ON ${entityClass.className}_${target}.${target}_${prop.via} = ${target}.${prop.via} WHERE ${entityClass.className}_${target}.${entityClass.className}_${prop.pk} = ?`,
                            row[prop.pk]
                        );
                } else if (prop.type === DataType.OBJECT) {
                    const target = prop.target;
                    if (row[prop.name] !== null)
                        inst[prop.name] = (await this.get(prop.target, `WHERE ${target}.${prop.via} = ?`, row[prop.name]))[0];
                } else {
                    inst[prop.name] = row[prop.name];
                }
            }
            for (const prop in inst) {
                if (prop.startsWith("_")) {
                    const counterpartProp = prop.substring(1); // Remove leading underscore
                    if (inst.hasOwnProperty(counterpartProp)) {
                        delete inst[prop];
                    }
                }
            }

            return inst;
        });

        return Promise.all(resultPromises);
    }
}


module.exports = {
    Database,
    DataType
}