import SQLiteStorage from 'react-native-sqlite-storage';

SQLiteStorage.DEBUG(__DEV__);       // 启动调试信息
SQLiteStorage.enablePromise(true);  // 使用 promise(true) 或者 callback(false)

export default class SQLite {
    constructor(databaseName, databaseVersion, databaseDisplayName, databaseSize) {
        this.databaseName = databaseName;
        this.databaseVersion = databaseVersion;
        this.databaseDisplayName = databaseDisplayName;
        this.databaseSize = databaseSize;
        this.successInfo = (name, absolutely) => {
            if (__DEV__) {
                if (absolutely) {
                    console.log(name);
                } else {
                    console.log(`SQLiteStorage ${name} success.`);
                }
            }
        };
        this.errorInfo = (name, err, absolutely) => {
            if (__DEV__) {
                if (absolutely) {
                    console.error(name);
                } else {
                    console.error(`SQLiteStorage ${name} error.`);
                }
                console.log(err);
            }
        };
        this.open = this._open.bind(this);
        this.close = this._close.bind(this);
        this.delete = this._delete.bind(this);
        this.createTable = this._createTable.bind(this);
        this.dropTable = this._dropTable.bind(this);
        this.insertItems = this._insertItems.bind(this);
        this.deleteItem = this._deleteItem.bind(this);
        this.updateItem = this._updateItem.bind(this);
        this.selectItems = this._selectItems.bind(this);
    }

    async _open() {
        let result = {};
        await SQLiteStorage.openDatabase(
            this.databaseName,
            this.databaseVersion,
            this.databaseDisplayName,
            this.databaseSize)
            .then((db) => {
                this.successInfo('open');
                this.db = db;
                result = { res: db };
            })
            .catch((err) => {
                this.errorInfo('open', err);
                result = { err };
            });
        return result;
    }

    async _delete() {
        let result = {};
        await SQLiteStorage.deleteDatabase(this.databaseName)
            .then((res) => {
                this.successInfo('deleteDataBase');
                result = { res };
            })
            .catch((err) => {
                this.errorInfo('deleteDataBase', err);
                result = { err };
            });
        return result;
    }

    async _close() {
        let result = {};
        if (this.db) {
            await this.db.close()
                .then(() => {
                    this.successInfo('close');
                    result = { res: ['database was closed'] };
                })
                .catch((err) => {
                    this.errorInfo('close', err);
                    result = { err };
                });
        } else {
            this.successInfo('SQLiteStorage not open', true);
        }
        this.db = null;
        return result;
    }

    async _createTable(tableInfo) {
        const { tableName, tableFields } = tableInfo;
        if (!this.db) {
            await this.open();
        }
        let result = {};
        // sql语句累加
        const sqlStr = tableFields.reduce((sqlSegment, field, index, arr) => (
            `${sqlSegment} ${field.columnName} ${field.dataType} ${index + 1 === arr.length ? ');' : ','}`
        ), `CREATE TABLE IF NOT EXISTS ${tableName}(`);
        // 创建表
        await this.db.executeSql(sqlStr)
            .then((res) => {
                this.successInfo('createTable');
                result = { res };
            })
            .catch((err) => {
                this.errorInfo('createTable', err);
                result = { err };
            });
        return result;
    }

    async _dropTable(tableName) {
        if (!this.db) {
            await this.open();
        }
        let result = {};
        // 删除表
        await this.db.executeSql(`DROP TABLE ${tableName};`)
            .then((res) => {
                this.successInfo('dropTable');
                result = { res };
            })
            .catch((err) => {
                this.errorInfo('dropTable', err);
                result = { err };
            });
        return result;
    }

    async _insertItems(tableName, items) {
        if (!this.db) {
            await this.open();
        }
        let result = {};
        const sqlStrArr = items.map((item) => {
            const columns = Object.keys(item);
            let sqlStr = columns.reduce((sqlSegment, columnName, index, arr) => (
                `${sqlSegment} ${columnName} ${index + 1 === arr.length ? ')' : ','}`
            ), `INSERT INTO ${tableName} (`);
            sqlStr += columns.reduce((sqlSegment, columnName, index, arr) => (
                `${sqlSegment} '${item[columnName]}' ${index + 1 === arr.length ? ');' : ','}`
            ), ' VALUES (');
            return sqlStr;
        });
        await this.db.sqlBatch(sqlStrArr)
            .then(() => {
                this.successInfo('insertItemsBatch');
                result = { res: ['databases execute sqlBatch success'] };
            })
            .catch((err) => {
                this.errorInfo('insertItemsBatch', err);
                result = { err };
            });
        return result;
    }

    async _deleteItem(tableName, condition) {
        if (!this.db) {
            await this.open();
        }
        let result = {};
        let sqlStr;
        if (condition && typeof condition === 'object' && condition !== {}) {
            const conditionKeys = Object.keys(condition);
            sqlStr = conditionKeys.reduce((sqlSegment, conditionKey, index, arr) => (
                `${sqlSegment} ${conditionKey}='${condition[conditionKey]}' ${index + 1 !== arr.length ? 'and' : ';'}`
            ), `DELETE FROM ${tableName} WHERE`);
        } else {
            sqlStr = `DELETE FROM ${tableName}`;
        }
        await this.db.executeSql(sqlStr)
            .then((res) => {
                this.successInfo(`SQLiteStorage deleteItem success: 影响 ${res[0].rowsAffected} 行`, true);
                result = { res };
            })
            .catch((err) => {
                this.errorInfo('deleteItem', err);
                result = { err };
            });
        return result;
    }

    async _updateItem(tableName, item, condition) {
        if (!this.db) {
            await this.open();
        }
        const columns = Object.keys(item);
        let result = {};
        let sqlStr;
        sqlStr = columns.reduce((sqlSegment, columnName, index, arr) => (
            `${sqlSegment} ${columnName}='${item[columnName]}' ${index + 1 !== arr.length ? ',' : ''}`
        ), `UPDATE ${tableName} SET`);
        const conditionKeys = Object.keys(condition);
        sqlStr += conditionKeys.reduce((sqlSegment, conditionKey, index, arr) => (
            `${sqlSegment} ${conditionKey}='${condition[conditionKey]}' ${index + 1 !== arr.length ? 'AND' : ';'}`
        ), ' WHERE');
        await this.db.executeSql(sqlStr)
            .then((res) => {
                this.successInfo(`SQLiteStorage updateItem success: 影响 ${res[0].rowsAffected} 行`, true);
                result = { res };
            })
            .catch((err) => {
                this.errorInfo('updateItem', err);
                result = { err };
            });
        return result;
    }

    async _selectItems(tableName, columns, condition, pagination, perPageNum) {
        if (this.db) {
            await this.open();
        }
        let result = {};
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
        await this.db.executeSql(sqlStr)
            .then((res) => {
                const queryResult = [];
                this.successInfo(`SQLiteStorage selectItems success: 查询到 ${res[0].rows.length} 行`, true);
                const len = res[0].rows.length;
                for (let i = 0; i < len; i++) {
                    queryResult.push(res[0].rows.item(i));
                }
                result = { res: queryResult };
            })
            .catch((err) => {
                this.errorInfo('selectItems', err);
                result = { err };
            });
        return result;
    }
}
