# react-native-sqlite-helper

[![996.icu](https://img.shields.io/badge/link-996.icu-red.svg)](https://996.icu) [![LICENSE](https://img.shields.io/badge/license-Anti%20996-blue.svg)](https://github.com/996icu/996.ICU/blob/master/LICENSE) [![stable](http://badges.github.io/stability-badges/dist/stable.svg)](http://github.com/badges/stability-badges)

这个库是基于 _[andpor/react-native-sqlite-storage](https://github.com/andpor/react-native-sqlite-storage)_ ，请先 install 和 link react-native-sqlite-storage。

特点：

(1) 使用 Promise

(2) 非阻塞

(3) 函数式 SQL

(4) 格式化的输出

## API

**1、实例化**

`import SQLiteHelper from 'react-native-sqlite-helper';`

`const sqliteH = new SQLiteHelper(databaseName: string, databaseVersion: string, databaseDisplayName: string, databaseSize: number);`

**2、打开 database**

`sqliteH.open();`

**3、关闭 database**

`sqliteH.close();`

**4、删除 database（静态方法）**

`SQLiteHelper.delete(database: string);`

**5、创建表**

`sqliteH.createTable(tableInfo: Table);`

```typescript
interface Table {
  tableName: string;
  tableFields: Array<Field>;
}
```

**6、删除表**

`sqliteH.dropTable(tableName: string);`

**7、插入数据（支持多条）**

`sqliteH.insertItems(tableName: string, items: object[]);`

**8、删除数据**

`sqliteH.deleteItem(tableName: string, conditions?: string | Conditions | Array<Condition>);`

```typescript
interface Condition {
  columnName: string,
  value: number | string,
  operator?: string,
}

interface Conditions {
  combine?: string,
  conditions: Array<Condition>,
}
```

**9、更新数据**

`sqliteH.updateItem(tableName: string, item: object, conditions?: string | Conditions | Array<Condition>);`

**10、查询数据**

`sqliteH.selectItems(tableName: string, config: Config);`

```typescript
interface Config {
  columns: string | string[];
  conditions?: string | Conditions | Array<Condition>;
  pageNo?: number;
  pageLength?: number;
}
```

**11、返回值格式**

> 成功时返回 `res`, 失败时返回 `err`

`const { res, err } = resolve_data: Result;`

```typescript
interface Result {
  res: any;
  err: Error | undefined;
}
```

## DEMO

```javascript
 // use async/await

 // The { res, err } in result can only have one value at a time, the other is undefined

 async _handleSQLite() {
        const sqliteH = new SQLiteHelper('test.db', '1.0', 'users', 2000);

        // 1.open database
        const { res: sqLite, err } = await sqliteH.open();
        // original sqLite Instance: execute sql
        sqLite.executeSql('SELECT * FROM Employee');

        // 2.delete db
        const { res, err } = await SQLiteHelper.delete('test.db');

        // 3.close database
        const { res, err } = await sqliteH.close();

        // 4.create table
        const { res, err } = await sqliteH.createTable({
            tableName: 'people',
            tableFields: [
                {
                    columnName: 'id',
                    dataType: 'INTEGER PRIMARY KEY AUTOINCREMENT',
                },
                {
                    columnName: 'name',
                    dataType: 'varchar',
                }, {
                    columnName: 'age',
                    dataType: 'int',
                }, {
                    columnName: 'sex',
                    dataType: 'varchar',
                },
            ],
        });

        // 5.drop table
        const { res, err } = await sqliteH.dropTable('people');

        // 6.insert items
        const userData = [
            {
                name: '张三',
                age: 26,
                sex: '男',
            },
            {
                name: '李四',
                age: 22,
                sex: '女',
            },
        ];
        const { res, err } = await sqliteH.insertItems('people', userData);

        // 7.delete item
        const { res, err } = await sqliteH.deleteItem('people', [{ columnName: 'age', value: 35, operator: '>=' }]);

        // 8.update item: conditions support [AND, OR, SQL]
        // 8.1.conditions AND: Fired male employees over 35 years old
        const { res, err } = await sqliteH.updateItem('people', { fire: 'YES' }, [
            { columnName: 'age', value: 35, operator: '>=' },
            { columnName: 'sex', value: 'male' }, // operator default: =
        ]);
        // 8.2.conditions OR: Fired employees over 35 years old or male employees
        const { res, err } = await sqliteH.updateItem('people', { fire: 'YES' }, {
            combine: 'OR',
            conditions: [
                { columnName: 'age', value: 35, operator: '>=' },
                { columnName: 'sex', value: 'male', operator: '=' },
            ],
        });
        // 8.3.conditions SQL
        const { res, err } = await sqliteH.updateItem('people', { fire: 'YES' }, 'age>=35 and sex=\'male\'');

        // 9.query all
        const { res, err } = await sqliteH.selectItems('people', '*');

        // 10.query some columns
        const { res, err } = await sqliteHelper.selectItems(
            'people',
            {
                columns: ['name', 'age', 'sex'],
                condition: [{ columnName: 'sex', value: 'male' }],
                pageNo: 1,
                pageLength: 5
            }
        );
    }
```

