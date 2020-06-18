import SQLiteStorage from 'react-native-sqlite-storage';

SQLiteStorage.DEBUG(__DEV__);
SQLiteStorage.enablePromise(true); // use promise(true) or use callback(false)

function isEmptyObj(obj) {
  return Object.prototype.toString.call(obj) === '[object Object]' && Object.keys(obj).length === 0;
}

function isObject(target) {
  return Object.prototype.toString.call(target) === '[object Object]';
}

// TODO: condition 支持大于小于等于等任何复杂条件的筛选，现在只简单支持等于

export default class SQLite {
  static async delete(databaseName) {
    return SQLiteStorage.deleteDatabase(databaseName)
      .then((res) => ({ res: res || `Database ${databaseName} DELETED` }))
      .catch((err) => ({ err }));
  }

  constructor(...rest) {
    // function overloading
    if (rest.length === 1 && isObject(rest[0])) {
      const [databaseOptions] = rest;
      this.databaseOptions = databaseOptions;
    } else {
      const [databaseName, databaseVersion, databaseDisplayName, databaseSize = -1] = rest;
      this.databaseName = databaseName;
      this.databaseVersion = databaseVersion;
      this.databaseDisplayName = databaseDisplayName;
      this.databaseSize = databaseSize;
    }
    this.successInfo = (text, absolutely) => {
      if (__DEV__) {
        if (absolutely === true) {
          console.log(text);
        } else {
          console.log(`[SQLiteHelper] info: database ${text} success.`);
        }
      }
    };
    this.warningInfo = (text, absolutely) => {
      if (__DEV__) {
        if (absolutely === true) {
          console.warn(text);
        } else {
          console.warn(`[SQLiteHelper] warn: ${text}.`);
        }
      }
    };
    this.errorInfo = (text, err, absolutely) => {
      if (__DEV__) {
        if (absolutely === true) {
          console.error(text);
        } else {
          console.error(`[SQLiteHelper] err: database ${text} error, ${err.message}`);
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
    // try to verify sqlite successful installation and operation
    const { failed } = await SQLiteStorage.echoTest().catch((err) => ({ failed: err }));
    // failed
    if (failed) return { err: failed };
    // passed
    let openDatabase;
    if (this.databaseOptions) {
      openDatabase = () => SQLiteStorage.openDatabase(this.databaseOptions);
    } else {
      openDatabase = () => SQLiteStorage.openDatabase(this.databaseName, this.databaseVersion, this.databaseDisplayName, this.databaseSize);
    }
    return openDatabase()
      .then((db) => {
        this.successInfo('open');
        this.db = db;
        return { res: db };
      })
      .catch((err) => {
        this.errorInfo('open', err);
        return { err };
      });
  }

  async _close() {
    if (this.db) {
      return this.db
        .close()
        .then((res) => {
          this.successInfo('close');
          this.db = null;
          return { res: res || 'Database CLOSED' };
        })
        .catch((err) => {
          this.errorInfo('close', err);
          return { err };
        });
    }
    this.warningInfo('Database was not OPENED');
    return { res: 'Database was not OPENED' };
  }

  async _createTable(tableInfo) {
    try {
      const { tableName, tableFields } = tableInfo;
      if (!tableName || !tableFields) throw new Error('Required parameter missing');
      if (!this.db) {
        const { err } = await this.open();
        if (err) throw err;
      }
      // Generate sql statement
      const sqlStr = tableFields.reduce(
        (sqlSegment, field, index, arr) => `${sqlSegment} ${field.columnName} ${field.dataType} ${index + 1 === arr.length ? ');' : ','}`,
        `CREATE TABLE IF NOT EXISTS ${tableName}(`,
      );
      return await this.db
        .executeSql(sqlStr)
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
      if (!tableName) throw new Error('Required parameter missing');
      if (!this.db) {
        const { err } = await this.open();
        if (err) throw err;
      }
      return await this.db
        .executeSql(`DROP TABLE ${tableName};`)
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
      if (!tableName || !items) throw new Error('Required parameter missing');
      if (typeof tableName !== 'string') throw new Error(`Parameter tableName expects string but ${typeof tableName}`);
      if (!Array.isArray(items)) throw new Error(`Parameter items expects array but ${typeof items}`);
      if (!this.db) {
        const { err } = await this.open();
        if (err) throw err;
      }
      const sqlStrArr = items.map((item) => {
        const columns = Object.keys(item);
        let sqlStr = columns.reduce((sqlSegment, columnName, index, arr) => `${sqlSegment} ${columnName} ${index + 1 === arr.length ? ')' : ','}`, `INSERT INTO ${tableName} (`);
        sqlStr += columns.reduce(
          (sqlSegment, columnName, index, arr) => `${sqlSegment} ${typeof item[columnName] !== 'number' ? `'${item[columnName]}'` : item[columnName]} ${index + 1 === arr.length ? ');' : ','}`,
          ' VALUES (',
        );
        return sqlStr;
      });
      return await this.db
        .sqlBatch(sqlStrArr)
        .then((res) => {
          this.successInfo('insertItemsBatch');
          return { res: res || 'All INSERT SQL done' };
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
      if (!tableName) throw new Error('Required parameter missing');
      if (!this.db) {
        const { err } = await this.open();
        if (err) throw err;
      }
      let sqlStr;
      if (isObject(condition) && !isEmptyObj(condition)) {
        const conditionKeys = Object.keys(condition);
        sqlStr = conditionKeys.reduce(
          (sqlSegment, conditionKey, index, arr) => `${sqlSegment} ${conditionKey}=${typeof condition[conditionKey] !== 'number' ? `'${condition[conditionKey]}'` : condition[conditionKey]} ${index + 1 !== arr.length ? 'AND' : ';'}`,
          `DELETE FROM ${tableName} WHERE`,
        );
      } else {
        sqlStr = `DELETE FROM ${tableName};`;
      }
      return await this.db
        .executeSql(sqlStr)
        .then((res) => {
          this.successInfo(`SQLiteStorage deleteItem success: 影响 ${res[0].rowsAffected} 行`, true);
          return { res: res || 'DELETE SQL done' };
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
      if (!tableName || !item) throw new Error('Required parameter missing');
      if (typeof tableName !== 'string') {
        throw new Error(`Parameter tableName expects string but ${typeof tableName}`);
      }
      if (!isObject(item)) {
        throw new Error(`Parameter item expects object but ${Object.prototype.toString.call(item)}`);
      }
      if (!this.db) {
        const { err } = await this.open();
        if (err) throw err;
      }
      const columns = Object.keys(item);
      let sqlStr;
      sqlStr = columns.reduce(
        (sqlSegment, columnName, index, arr) => `${sqlSegment} ${columnName}=${typeof item[columnName] !== 'number' ? `'${item[columnName]}'` : item[columnName]} ${index + 1 !== arr.length ? ',' : ''}`,
        `UPDATE ${tableName} SET`,
      );
      if (condition && condition !== {} && typeof condition === 'object') {
        const conditionKeys = Object.keys(condition);
        sqlStr += conditionKeys.reduce(
          (sqlSegment, conditionKey, index, arr) => `${sqlSegment} ${conditionKey}=${typeof condition[conditionKey] !== 'number' ? `'${condition[conditionKey]}'` : condition[conditionKey]} ${index + 1 !== arr.length ? 'AND' : ';'}`,
          ' WHERE',
        );
      } else sqlStr += ';';
      return await this.db
        .executeSql(sqlStr)
        .then((res) => {
          this.successInfo(`SQLiteStorage updateItem success: 影响 ${res[0].rowsAffected} 行`, true);
          return { res: res || 'UPDATE SQL done' };
        })
        .catch((err) => {
          this.errorInfo('updateItem', err);
          return { err };
        });
    } catch (err) {
      return { err };
    }
  }

  async _selectItems(tableName, config = {}) {
    try {
      const {
        columns = '*', condition, pageNo, pageLength,
      } = config;
      if (!tableName) throw new Error('Required parameter missing');
      if (!this.db) {
        const { err } = await this.open();
        if (err) throw err;
      }
      let sqlStr;
      if (columns === '*') {
        if (isObject(condition) && !isEmptyObj(condition)) {
          const conditionKeys = Object.keys(condition);
          sqlStr = conditionKeys.reduce(
            (sqlSegment, conditionKey, index, arr) => `${sqlSegment} ${conditionKey}=${typeof condition[conditionKey] !== 'number' ? `'${condition[conditionKey]}'` : condition[conditionKey]} ${index + 1 !== arr.length ? 'AND' : ''}`,
            `SELECT * FROM ${tableName} WHERE`,
          );
        } else {
          sqlStr = `SELECT * FROM ${tableName}`;
        }
      } else {
        sqlStr = columns.reduce((sqlSegment, column, index, arr) => `${sqlSegment} ${column} ${index + 1 !== arr.length ? ',' : ''}`, 'SELECT');
        if (isObject(condition) && !isEmptyObj(condition)) {
          const conditionKeys = Object.keys(condition);
          sqlStr += conditionKeys.reduce(
            (sqlSegment, conditionKey, index, arr) => `${sqlSegment} ${conditionKey}=${typeof condition[conditionKey] !== 'number' ? `'${condition[conditionKey]}'` : condition[conditionKey]} ${index + 1 !== arr.length ? 'AND' : ''}`,
            ` FROM ${tableName} WHERE`,
          );
        } else {
          sqlStr += ` FROM ${tableName}`;
        }
      }
      if (pageNo && pageLength) {
        const limit = pageNo * pageLength;
        const offset = pageLength * (pageNo - 1) > 0 ? pageLength * (pageNo - 1) : 0;
        sqlStr += ` limit ${limit} offset ${offset};`;
      } else {
        sqlStr += ';';
      }
      return await this.db
        .executeSql(sqlStr)
        .then((res) => {
          if (res && res[0] && res[0].rows) {
            this.successInfo(`SQLiteStorage selectItems success: 查询到 ${res[0].rows.length} 行`, true);
            const queryResult = [];
            const len = res[0].rows.length;
            for (let i = 0; i < len; i++) {
              queryResult.push(res[0].rows.item(i));
            }
            return { res: queryResult };
          }
          return { res };
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
