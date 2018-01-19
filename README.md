# react-native-sqlite-helper

This repository is based on *[andpor/react-native-sqlite-storage](https://github.com/andpor/react-native-sqlite-storage)*, you should install and link react-native-sqlite-storage first.

这个库是基于 *[andpor/react-native-sqlite-storage](https://github.com/andpor/react-native-sqlite-storage)* ，请先 install 和 link react-native-sqlite-storage

Features:

(1) use Promise | *使用Promise*

(2) be based on react-native-sqlite-storage *[(readme)](https://github.com/andpor/react-native-sqlite-storage)* | 基于 react-native-sqlite-storage

(3) parameterized SQL | 参数化的SQL

(4) prefer generator function | 统一返回的数据结构 {res,err}


## api | 接口方法

**1.instantiation | 实例化**

`import SQLiteHelper from 'react-native-sqlite-helper';`

`const sqLiteHelper = new SQLiteHelper(`

`databaseName:string,`

`databaseVersion:string,`

`databaseDisplayName:string,`

`databaseSize:number);`

**2.open database | 连接 database**

`sqLiteHelper.open(); // 会返回原始的SQLite实例，可以直接执行sql`

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
 // use es6 async/await

 async _handleSQLite() {
        const sqLiteHelper = new SQLiteHelper('test.db', '1.0', 'users', 2000);
        // 开启数据库
        const { res: sqLite, err: err1 } = await sqLiteHelper.open();
        console.log(sqLite, err1);
        // 删除db：静态方法
        const { res: res2, err: err2 } = await SQLiteHelper.delete('test.db');
        console.log(res2, err2);
        // 关闭数据库
        const { res: res3, err: err3 } = await sqLiteHelper.close();
        console.log(res3, err3);
        // 建表
        const { res: res4, err: err4 } = await sqLiteHelper.createTable({
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
        console.log(res4, err4);
        // 删除表
        const { res: res5, err: err5 } = await sqLiteHelper.dropTable('people');
        console.log(res5, err5);
        // 插入数据
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
        const { res: res6, err: err6 } = await sqLiteHelper.insertItems('people', userData);
        console.log(res6, err6);
        // 删除数据
        const { res: res7, err: err7 } = await sqLiteHelper.deleteItem('people', { name: 'zhanggl' });
        console.log(res7);
        // 更改数据
        const { res: res8, err: err8 } = await sqLiteHelper.updateItem('people', { name: 'zhangqi' }, { name: 'zhangqi1', age: '22' });
        console.log(res8);
        // 查询数据：第一页，每页5条数据
        const { res: res9, err: err9 } = await sqLiteHelper.selectItems('people', '*', null, 1, 5);
        console.log(res9);
        // 查询所有
        const { res: res10, err: err10} = await sqLiteHelper.selectItems('people', '*', null);
        console.log(res10);
    }
```