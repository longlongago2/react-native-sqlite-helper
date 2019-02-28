# react-native-sqlite-helper

This repository is based on *[andpor/react-native-sqlite-storage](https://github.com/andpor/react-native-sqlite-storage)*, you should install and link react-native-sqlite-storage first.

这个库是基于 *[andpor/react-native-sqlite-storage](https://github.com/andpor/react-native-sqlite-storage)* ，请先 install 和 link react-native-sqlite-storage。

Features:

(1) use Promise | *使用Promise*

(2) be based on react-native-sqlite-storage *[(readme)](https://github.com/andpor/react-native-sqlite-storage)* | 基于 react-native-sqlite-storage

(3) parameterized SQL | 参数化的SQL

(4) prefer generator function & return {res,err} | 统一返回的数据结构 {res,err}


## api | 接口方法

**1.instantiation | 实例化**

`import SQLiteHelper from 'react-native-sqlite-helper';`

`const sqLiteHelper = new SQLiteHelper(`

`databaseName:string,`

`databaseVersion:string,`

`databaseDisplayName:string,`

`databaseSize:number);`

**2.open database | 连接 database**

`sqLiteHelper.open();`

**3.close database | 关闭 database**

`sqLiteHelper.close();`

**4.delete database(static) | 删除 database（静态方法）**

`SQLiteHelper.delete(database:string);`

**5.creteTable | 创建表**

`sqLiteHelper.createTable(tableInfo:object);`

**6.dropTable | 删除表**

`sqLiteHelper.dropTable(tableName:string);`

**7.insertItems | 插入数据（支持多条）**

`sqLiteHelper.insertItems(tableName:string,items:Array<object>);`

**8.deleteItem | 删除数据**

`sqLiteHelper.deleteItem(tableName:string,condition:object);`

**9.updateItem | 更新数据**

`sqLiteHelper.updateItem(tableName:string,item:object,condition:object);`

**10.selectItems | 查询数据**

`sqLiteHelper.selectItems(`

`tableName:string,`

`columns:Array<string>|*,`

`condition:object|null,`

`pagination?:number,`

`perPageNum?:number);`

**11.Promise resolve data | Promise返回值格式**

`const {res,err} = resolve_data;`

`res:any|'undefined' (success data,if error return 'undefined')`
`err:Error|'undefined' (error data, if success return 'undefined')`

## example | 例子

```
 // use async/await

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
                    dataType: 'varchar',
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
                age: '26',
                sex: '男',
            },
            {
                name: '李四',
                age: '22',
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
    }
```

## Changelog | 变更记录

[CHANGELOG](./CHANGELOG.md)