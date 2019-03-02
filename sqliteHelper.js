import SQLiteStorage from 'react-native-sqlite-storage';

SQLiteStorage.DEBUG(__DEV__);       // 启动调试信息
SQLiteStorage.enablePromise(true);  // 使用 promise(true) 或者 callback(false)

export default class SQLite {
    static async delete(database) {
        return await SQLiteStorage.deleteDatabase(database)
            .then(res => ({ res }))
            .catch(err => ({ err }));
    }

    constructor(databaseName, databaseVersion, databaseDisplayName, databaseSize) {
        this.databaseName = databaseName;
        this.databaseVersion = databaseVersion;
        this.databaseDisplayName = databaseDisplayName;
        this.databaseSize = databaseSize;
        this.successInfo = (text, absolutely) => {
            if (__DEV__) {
                if (absolutely) {
                    console.log(text);
                } else {
                    console.log(`SQLiteHelper ${text} success.`);
                }
            }
        };
        this.errorInfo = (text, err, absolutely) => {
            if (__DEV__) {
                if (absolutely) {
                    console.log(text);
                } else {
                    console.log(`SQLiteHelper ${text} error: ${err.message}`);
                }
            }
        };
        this.open = this._open.bind(this);
        this.close = this._close.bind(this);
        this.createTable = this._createTable.bind(this);
        this.dropTable = this._dropTable.bind(this);
        this.insertItems = this._insertItems.bind(this);
        this.deleteItem = this._deleteItem.bind(this);
        this.updateItem = this._updateItem.bind(this);
        this.selectItems = this._selectItems.bind(this);
    }

    async _open() {
        const result = await SQLiteStorage.openDatabase(
            this.databaseName,
            this.databaseVersion,
            this.databaseDisplayName,
            this.databaseSize,
        )
            .then((db) => {
                this.successInfo('open');
                return { res: db };
            })
            .catch((err) => {
                this.errorInfo('open', err);
                return { err };
            });
        if (result.res) {
            this.db = result.res;
        }
        return result;
    }

    async _close() {
        if (this.db) {
            const result = await this.db.close()
                .then((res) => {
                    this.successInfo('close');
                    return { res: res || ['success'] };
                })
                .catch((err) => {
                    this.errorInfo('close', err);
                    return { err };
                });
            this.db = null;
            return result;
        }
        this.successInfo('SQLiteStorage haven not opened', true);
        return true;
    }

    async _createTable(tableInfo) {
        try {
            const { tableName, tableFields } = tableInfo;
            if (!this.db) {
                await this.open();
            }
            // sql语句累加
            const sqlStr = tableFields.reduce((sqlSegment, field, index, arr) => (
                `${sqlSegment} ${field.columnName} ${field.dataType} ${index + 1 === arr.length ? ');' : ','}`
            ), `CREATE TABLE IF NOT EXISTS ${tableName}(`);
            // 创建表
            return await this.db.executeSql(sqlStr)
                .then((res) => {
                    this.successInfo('createTable');
                    return { res };
                })
                .catch((err) => {
                    this.errorInfo('createTable', err);
                    return { err };
                });
        } catch (err) {
            return { err };
        }
    }

    async _dropTable(tableName) {
        try {
            if (!this.db) {
                await this.open();
            }
            if (!tableName) throw new Error('Required parameter missing');
            // 删除表
            return await this.db.executeSql(`DROP TABLE ${tableName};`)
                .then((res) => {
                    this.successInfo('dropTable');
                    return { res };
                })
                .catch((err) => {
                    this.errorInfo('dropTable', err);
                    return { err };
                });
        } catch (err) {
            return { err };
        }
    }

    async _insertItems(tableName, items) {
        try {
            if (!this.db) {
                await this.open();
            }
            if (!tableName || !items) throw new Error('Required parameter missing');
            if (typeof tableName !== 'string') throw new Error(`Parameter tableName expects string but ${typeof tableName}`);
            if (!Array.isArray(items)) throw new Error(`Parameter items expects array but ${typeof items}`);
            const sqlStrArr = items.map((item) => {
                const columns = Object.keys(item);
                let sqlStr = columns.reduce((sqlSegment, columnName, index, arr) => (
                    `${sqlSegment} ${columnName} ${index + 1 === arr.length ? ')' : ','}`
                ), `INSERT INTO ${tableName} (`);
                sqlStr += columns.reduce((sqlSegment, columnName, index, arr) => (
                    `${sqlSegment} ${typeof item[columnName] !== 'number' ? `'${item[columnName]}'` : item[columnName]} ${index + 1 === arr.length ? ');' : ','}`
                ), ' VALUES (');
                return sqlStr;
            });
            return await this.db.sqlBatch(sqlStrArr)
                .then((res) => {
                    this.successInfo('insertItemsBatch');
                    return { res: res || ['success'] };
                })
                .catch((err) => {
                    this.errorInfo('insertItemsBatch', err);
                    return { err };
                });
        } catch (err) {
            return { err };
        }
    }

    async _deleteItem(tableName, condition) {
        try {
            if (!this.db) {
                await this.open();
            }
            let sqlStr;
            if (condition && typeof condition === 'object' && condition !== {}) {
                const conditionKeys = Object.keys(condition);
                sqlStr = conditionKeys.reduce((sqlSegment, conditionKey, index, arr) => (
                    `${sqlSegment} ${conditionKey}='${condition[conditionKey]}' ${index + 1 !== arr.length ? 'and' : ';'}`
                ), `DELETE FROM ${tableName} WHERE`);
            } else {
                sqlStr = `DELETE FROM ${tableName}`;
            }
            return await this.db.executeSql(sqlStr)
                .then((res) => {
                    this.successInfo(`SQLiteStorage deleteItem success: 影响 ${res[0].rowsAffected} 行`, true);
                    return { res };
                })
                .catch((err) => {
                    this.errorInfo('deleteItem', err);
                    return { err };
                });
        } catch (err) {
            return { err };
        }
    }

    async _updateItem(tableName, item, condition) {
        try {
            if (!this.db) {
                await this.open();
            }
            const columns = Object.keys(item);
            let sqlStr;
            sqlStr = columns.reduce((sqlSegment, columnName, index, arr) => (
                `${sqlSegment} ${columnName}='${item[columnName]}' ${index + 1 !== arr.length ? ',' : ''}`
            ), `UPDATE ${tableName} SET`);
            if (condition && condition !== {} && typeof condition === 'object') {
                const conditionKeys = Object.keys(condition);
                sqlStr += conditionKeys.reduce((sqlSegment, conditionKey, index, arr) => (
                    `${sqlSegment} ${conditionKey}='${condition[conditionKey]}' ${index + 1 !== arr.length ? 'AND' : ';'}`
                ), ' WHERE');
            } else sqlStr += ';';
            return await this.db.executeSql(sqlStr)
                .then((res) => {
                    this.successInfo(`SQLiteStorage updateItem success: 影响 ${res[0].rowsAffected} 行`, true);
                    return { res };
                })
                .catch((err) => {
                    this.errorInfo('updateItem', err);
                    return { err };
                });
        } catch (err) {
            return { err };
        }
    }

    async _selectItems(tableName, columns, condition, pagination, perPageNum) {
        try {
            if (!this.db) {
                await this.open();
            }
            let sqlStr;
            if (columns === '*') {
                if (condition && condition !== {} && typeof condition === 'object') {
                    const conditionKeys = Object.keys(condition);
                    sqlStr = conditionKeys.reduce((sqlSegment, conditionKey, index, arr) => (
                        `${sqlSegment} ${conditionKey}='${condition[conditionKey]}' ${index + 1 !== arr.length ? 'AND' : ''}`
                    ), `SELECT * FROM ${tableName} WHERE`);
                } else {
                    sqlStr = `SELECT * FROM ${tableName}`;
                }
            } else {
                sqlStr = columns.reduce((sqlSegment, column, index, arr) => (
                    `${sqlSegment} ${column} ${index + 1 !== arr.length ? ',' : ''}`
                ), 'SELECT');
                if (condition && condition !== {} && typeof condition === 'object') {
                    const conditionKeys = Object.keys(condition);
                    sqlStr += conditionKeys.reduce((sqlSegment, conditionKey, index, arr) => (
                        `${sqlSegment} ${conditionKey}='${condition[conditionKey]}' ${index + 1 !== arr.length ? 'AND' : ''}`
                    ), ` FROM ${tableName} WHERE`);
                } else {
                    sqlStr += ` FROM ${tableName}`;
                }
            }
            if (pagination && perPageNum) {
                const limit = pagination * perPageNum;
                const offset = perPageNum * (pagination - 1) > 0 ? perPageNum * (pagination - 1) : 0;
                sqlStr += ` limit ${limit} offset ${offset};`;
            } else {
                sqlStr += ';';
            }
            return await this.db.executeSql(sqlStr)
                .then((res) => {
                    const queryResult = [];
                    this.successInfo(`SQLiteStorage selectItems success: 查询到 ${res[0].rows.length} 行`, true);
                    const len = res[0].rows.length;
                    for (let i = 0; i < len; i++) {
                        queryResult.push(res[0].rows.item(i));
                    }
                    return { res: queryResult };
                })
                .catch((err) => {
                    this.errorInfo('selectItems', err);
                    return { err };
                });
        } catch (err) {
            return { err };
        }
    }
}
