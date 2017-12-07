# react-native-sqlite-helper

This repository is based on *[andpor/react-native-sqlite-storage](https://github.com/andpor/react-native-sqlite-storage)*, you should install and link react-native-sqlite-storage first.

Features:

(1) use Promise

(2) be based on react-native-sqlite-storage *[(readme)](https://github.com/andpor/react-native-sqlite-storage)*


## api

**1.instantiation**

`const sqLite = new SQLite(`
`databaseName:string,`
`databaseVersion:string,`
`databaseDisplayName:string,`
`databaseSize:number);`


**2.open database**

`sqLite.open();`

**3.close database**

`sqLite.close();`

**4.delete database**

`sqLite.delete();`

**5.creteTable**

`sqLite.createTable(tableInfo:object);`

**6.dropTable**

`sqLite.dropTable(tableName:string);`

**7.insertItems**

`sqLite.insertItems(tableName:string,items:Array<object>);`

**8.deleteItem**

`sqLite.deleteItem(tableName:string,condition:object);`

**9.updateItem**

`sqLite.updateItem(tableName:string,item:object,condition:object);`

**10.selectItems**

`sqLite.selectItems(`
`tableName:string,`
`columns:Array<string>|*,`
`condition:object|null,`
`pagination?:number,`
`perPageNum?:number);`

**11.Promise resolve data**

`const {res,err} = resolve_data;`

`res:any|'undefined' (success data,if error return 'undefined')`
`err:Error|'undefined' (error data, if success return 'undefined')`

## example

```
 async _handleSQLite() {
        const sqLite = new SQLite('test.db', '1.0', 'users', 2000);
        // 开启数据库
        const { res: db, err: err1 } = await sqLite.open();
        console.log(db, err1);
        // 删除db
        const { res: res2, err: err2 } = await sqLite.delete();
        console.log(res2, err2);
        // 关闭数据库
        const { res: res3, err: err3 } = await sqLite.close();
        console.log(res3, err3);
        // 建表
        const { res: res4, err: err4 } = await sqLite.createTable({
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
        const { res: res5, err: err5 } = await sqLite.dropTable('people');
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
        const { res: res6, err: err6 } = await sqLite.insertItems('people', userData);
        console.log(res6, err6);
        // 删除数据
        const { res: res7, err: err7 } = await sqLite.deleteItem('people', { name: 'zhanggl' });
        console.log(res7);
        // 更改数据
        const { res: res8, err: err8 } = await sqLite.updateItem('people', { name: 'zhangqi' }, { name: 'zhangqi1', age: '22' });
        console.log(res8);
        // 查询数据：第一页，每页5条数据
        const { res: res9, err: err9 } = await sqLite.selectItems('people', '*', null, 1, 5);
        console.log(res9);
        // 查询所有
        const { res: res10, err: err10} = await sqLite.selectItems('people', '*', null);
        console.log(res10);
    }
```