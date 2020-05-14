# react-native-sqlite-helper

[![996.icu](https://img.shields.io/badge/link-996.icu-red.svg)](https://996.icu) [![LICENSE](https://img.shields.io/badge/license-Anti%20996-blue.svg)](https://github.com/996icu/996.ICU/blob/master/LICENSE) [![stable](http://badges.github.io/stability-badges/dist/stable.svg)](http://github.com/badges/stability-badges)

这个库是基于 *[andpor/react-native-sqlite-storage](https://github.com/andpor/react-native-sqlite-storage)* ，请先 install 和 link react-native-sqlite-storage。

特点：

(1) 使用 Promise

(2) 非阻塞

(3) 函数式 SQL

(4) 格式化的输出


## API

**1、实例化**

`import SQLiteHelper from 'react-native-sqlite-helper';`

`const sqLiteHelper = new SQLiteHelper(`

`databaseName:string,`

`databaseVersion:string,`

`databaseDisplayName:string,`

`databaseSize:number);`

**2、打开 database**

`sqLiteHelper.open();`

**3、关闭 database**

`sqLiteHelper.close();`

**4、删除 database（静态方法）**

`SQLiteHelper.delete(database:string);`

**5、创建表**

`sqLiteHelper.createTable(tableInfo:object);`

**6、删除表**

`sqLiteHelper.dropTable(tableName:string);`

**7、插入数据（支持多条）**

`sqLiteHelper.insertItems(tableName:string,items:Array<object>);`

**8、删除数据**

`sqLiteHelper.deleteItem(tableName:string,condition:object);`

**9、更新数据**

`sqLiteHelper.updateItem(tableName:string,item:object,condition:object);`

**10、查询数据**

`sqLiteHelper.selectItems(`

`tableName:string,`

`columns:Array<string>|*,`

`condition:object|null,`

`pagination?:number,`

`perPageNum?:number`

`);`

**11、返回值格式**

> 成功时返回 `res`, 失败时返回 `err`

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
