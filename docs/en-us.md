# react-native-sqlite-helper

[![996.icu](https://img.shields.io/badge/link-996.icu-red.svg)](https://996.icu) [![LICENSE](https://img.shields.io/badge/license-Anti%20996-blue.svg)](https://github.com/996icu/996.ICU/blob/master/LICENSE) [![stable](http://badges.github.io/stability-badges/dist/stable.svg)](http://github.com/badges/stability-badges)

This repository is based on _[andpor/react-native-sqlite-storage](https://github.com/andpor/react-native-sqlite-storage)_, you should install and link react-native-sqlite-storage first.

Features:

(1) Use Promise

(2) Non-blocking

(3) Functional SQL

(4) Formatted return

## API

**1.instantiation**

`import SQLiteHelper from 'react-native-sqlite-helper';`

`const sqliteH = new SQLiteHelper(databaseName: string, databaseVersion: string, databaseDisplayName: string, databaseSize: number);`

**2.open database**

`sqLiteHelper.open();`

**3.close database**

`sqLiteHelper.close();`

**4.delete database(static)**

`SQLiteHelper.delete(database: string);`

**5.create table**

`sqliteH.createTable(tableInfo: Table);`

```typescript
interface Table {
  tableName: string;
  tableFields: Array<Field>;
}
```

**6.drop table**

`sqLiteHelper.dropTable(tableName: string);`

**7.insert**

`sqLiteHelper.insertItems(tableName: string, items: object[]);`

**8.delete**

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

**9.update**

`sqliteH.updateItem(tableName: string, item: object, conditions?: string | Conditions | Array<Condition>);`

**10.query**

`sqliteH.selectItems(tableName: string, config: Config);`

```typescript
interface Config {
  columns: string | string[];
  conditions?: string | Conditions | Array<Condition>;
  pageNo?: number;
  pageLength?: number;
}
```

**11.resolve data**

> Return `res` on success, return `err` on failure

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