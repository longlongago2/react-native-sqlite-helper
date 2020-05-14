# react-native-sqlite-helper

[![996.icu](https://img.shields.io/badge/link-996.icu-red.svg)](https://996.icu) [![LICENSE](https://img.shields.io/badge/license-Anti%20996-blue.svg)](https://github.com/996icu/996.ICU/blob/master/LICENSE) [![stable](http://badges.github.io/stability-badges/dist/stable.svg)](http://github.com/badges/stability-badges)

This repository is based on *[andpor/react-native-sqlite-storage](https://github.com/andpor/react-native-sqlite-storage)*, you should install and link react-native-sqlite-storage first.

Features:

(1) Use Promise

(2) Non-blocking

(3) Functional SQL

(4) Formatted return


## API

**1.instantiation**

`import SQLiteHelper from 'react-native-sqlite-helper';`

`const sqLiteHelper = new SQLiteHelper(`

`databaseName:string,`

`databaseVersion:string,`

`databaseDisplayName:string,`

`databaseSize:number);`

**2.open database**

`sqLiteHelper.open();`

**3.close database**

`sqLiteHelper.close();`

**4.delete database(static)**

`SQLiteHelper.delete(database:string);`

**5.create table**

`sqLiteHelper.createTable(tableInfo:object);`

**6.drop table**

`sqLiteHelper.dropTable(tableName:string);`

**7.insert**

`sqLiteHelper.insertItems(tableName:string,items:Array<object>);`

**8.delete**

`sqLiteHelper.deleteItem(tableName:string,condition:object);`

**9.update**

`sqLiteHelper.updateItem(tableName:string,item:object,condition:object);`

**10.query**

`sqLiteHelper.selectItems(`

`tableName:string,`

`columns:Array<string>|*,`

`condition:object|null,`

`pagination?:number,`

`perPageNum?:number);`

**11.resolve data**

> Return `res` on success, return `err` on failure

`const { res, err } = resolve_data;`

`res: any | undefined`

`err: Error | undefined`

## Example

```
 // use async/await

 // The { res, err } in result can only have one value at a time, the other is undefined

 async _handleSQLite() {
        const sqLiteHelper = new SQLiteHelper('test.db', '1.0', 'users', 2000);

        // 1.open database
        const { res: sqLite, err } = await sqLiteHelper.open();
        // original sqLite Instance: execute sql
        sqLite.executeSql('SELECT * FROM Employee');
        ...

        // 2.delete db
        const { res, err } = await SQLiteHelper.delete('test.db');
        ...

        // 3.close database
        const { res, err } = await sqLiteHelper.close();
        ...

        // 4.create table
        const { res, err } = await sqLiteHelper.createTable({
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
        ...

        // 5.drop table
        const { res, err } = await sqLiteHelper.dropTable('people');
        ...

        // 6.insert items
        const userData = [
            {
                name: 'Lily',
                age: 26,
                sex: 'male',
            },
            {
                name: 'Mike',
                age: 22,
                sex: 'female',
            },
        ];
        const { res, err } = await sqLiteHelper.insertItems('people', userData);
        ...

        // 7.delete item
        const { res, err } = await sqLiteHelper.deleteItem('people', { name: 'zhanggl' });
        ...

        // 8.update item
        const { res, err } = await sqLiteHelper.updateItem('people', { name: 'XiaoMing' }, { name: 'XiaoZhang', age: '22' });
        ...

        // 9.query: the first page, five items per page
        const { res, err } = await sqLiteHelper.selectItems('people', '*', null, 1, 5);
        ...

        // 10.query all
        const { res, err } = await sqLiteHelper.selectItems('people', '*', null);
        ...

        // 11.query some columns
        const { res, err } = await sqliteHelper.selectItems(
            'people',
            ['name', 'age', 'sex'],
            { age: 22 },
            1,
            5
        );
        ...
    }
```
