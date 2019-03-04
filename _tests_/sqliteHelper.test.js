import SQLiteStorage from 'react-native-sqlite-storage';
import SQLiteHelper from '../sqliteHelper';

__DEV__ = false;

jest.mock('react-native-sqlite-storage'); // 模拟sqliteHelper.js中的依赖模块

// TODO: 多层then回调 coverage检测不到代码覆盖率，then只能检测到一层回调，所以多层then回调的统一使用 async/await

describe('Test instance method: open', () => {
    test('sqliteHelper open sqlite database success', () => {
        SQLiteStorage.openDatabase.mockResolvedValue('open success'); // 模拟open方法中使用到的依赖方法

        const sqliteHelper = new SQLiteHelper('test.db', '1.0', 'users', 2000);
        sqliteHelper.open().then(({ res, err }) => {
            expect(res).toEqual('open success');
            expect(err).toBeUndefined();
        });
    });

    test('sqliteHelper open sqlite database failed', () => {
        SQLiteStorage.openDatabase.mockRejectedValue(new Error('open failed'));

        const sqliteHelper = new SQLiteHelper('test.db', '1.0', 'users', 2000);
        sqliteHelper.open().then(({ res, err }) => {
            expect(err.message).toEqual('open failed');
            expect(res).toBeUndefined();
        });
    });
});

describe('Test static method: delete', () => {
    test('sqliteHelper delete sqlite database success', () => {
        SQLiteStorage.deleteDatabase = jest.fn(database =>
            Promise.resolve(database)); // 模拟deleteDatabase静态方法

        SQLiteHelper.delete('test.db').then(({ res, err }) => {
            expect(res).toEqual('test.db');
            expect(err).toBeUndefined();
        });
    });

    test('sqliteHelper delete sqlite database failed', () => {
        SQLiteStorage.deleteDatabase = jest.fn(database =>
            Promise.reject(new Error(`delete ${database} error`)));

        SQLiteHelper.delete('test.db').then(({ res, err }) => {
            expect(err.message).toEqual('delete test.db error');
            expect(res).toBeUndefined();
        });
    });
});

describe('Test instance method: close', () => {
    test('sqliteHelper close sqlite database success', async () => {
        SQLiteStorage.openDatabase.mockResolvedValue({
            close: jest.fn(() => Promise.resolve()),
        });

        const sqliteHelper = new SQLiteHelper('test.db', '1.0', 'users', 2000);
        // 不存在this.db：没有实例化
        sqliteHelper.close().then((res) => {
            expect(res).toBeTruthy();
        });
        // 存在this.db：找到实例，证明已经open，可以执行关闭
        await sqliteHelper.open();
        const { res, err } = await sqliteHelper.close();
        // res 和 err 同时只能有一个值存在，另一个为undefined
        expect(res).toEqual(['success']);
        expect(err).toBeUndefined();
    });

    test('sqliteHelper close sqlite database failed', async () => {
        SQLiteStorage.openDatabase.mockResolvedValue({
            close: jest.fn(() => Promise.reject(new Error('close failed'))),
        });

        const sqliteHelper = new SQLiteHelper('test.db', '1.0', 'users', 2000);
        sqliteHelper.close().then((res) => {
            expect(res).toBeTruthy();
        });
        await sqliteHelper.open();
        const { res, err } = await sqliteHelper.close();
        expect(err.message).toEqual('close failed');
        expect(res).toBeUndefined();
    });
});

describe('Test instance method: createTable', () => {
    test('sqliteHelper createTable success', async () => {
        SQLiteStorage.openDatabase.mockResolvedValue({
            executeSql: jest.fn(sqlStr => Promise.resolve(sqlStr)),
        });

        const sqliteHelper = new SQLiteHelper('test.db', '1.0', 'users', 2000);
        const { res, err } = await sqliteHelper.createTable({
            tableName: 'people',
            tableFields: [
                {
                    columnName: 'id',
                    dataType: 'INTEGER PRIMARY KEY AUTOINCREMENT',
                },
                {
                    columnName: 'name',
                    dataType: 'varchar',
                },
                {
                    columnName: 'age',
                    dataType: 'int',
                },
                {
                    columnName: 'sex',
                    dataType: 'varchar',
                },
            ],
        });
        expect(res).toEqual('CREATE TABLE IF NOT EXISTS people( id INTEGER PRIMARY KEY AUTOINCREMENT , name varchar , age int , sex varchar );');
        expect(err).toBeUndefined();
    });

    test('sqliteHelper createTable failed', async () => {
        SQLiteStorage.openDatabase.mockResolvedValue({
            executeSql: jest.fn(() =>
                Promise.reject(new Error('executeSql error'))),
        });

        const sqliteHelper = new SQLiteHelper('test.db', '1.0', 'users', 2000);
        // 不传参数：获取参数失败
        const { res, err } = await sqliteHelper.createTable();
        expect(res).toBeUndefined();
        expect(err).toBeInstanceOf(Error);
        // 传参数：执行sql失败
        const { res: res1, err: err1 } = await sqliteHelper.createTable({
            tableName: 'test',
            tableFields: [],
        });
        expect(res1).toBeUndefined();
        expect(err1.message).toEqual('executeSql error');
    });
});

describe('Test instance method: dropTable', () => {
    test('sqliteHelper dropTable success', async () => {
        SQLiteStorage.openDatabase.mockResolvedValue({
            executeSql: jest.fn(sqlStr => Promise.resolve(sqlStr)),
        });

        const sqliteHelper = new SQLiteHelper('test.db', '1.0', 'users', 2000);
        const { res, err } = await sqliteHelper.dropTable('people');
        expect(res).toEqual('DROP TABLE people;');
        expect(err).toBeUndefined();
    });

    test('sqliteHelper dropTable failed', async () => {
        SQLiteStorage.openDatabase.mockResolvedValue({
            executeSql: jest.fn(() =>
                Promise.reject(new Error('executeSql error'))),
        });

        const sqliteHelper = new SQLiteHelper('test.db', '1.0', 'users', 2000);
        // 无参数
        const { res, err } = await sqliteHelper.dropTable();
        expect(res).toBeUndefined();
        expect(err.message).toEqual('Required parameter missing');
        // 有参数
        const { res: res1, err: err1 } = await sqliteHelper.dropTable('people');
        expect(res1).toBeUndefined();
        expect(err1.message).toEqual('executeSql error');
    });
});

describe('Test instance method: insertItems', () => {
    test('sqliteHelper insertItems success', async () => {
        SQLiteStorage.openDatabase.mockResolvedValue({
            sqlBatch: jest.fn(sqlStrArr => Promise.resolve(sqlStrArr)),
        });

        const sqliteHelper = new SQLiteHelper('test.db', '1.0', 'users', 2000);
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
        const { res, err } = await sqliteHelper.insertItems('people', userData);
        expect(res).toEqual([
            'INSERT INTO people ( name , age , sex ) VALUES ( \'张三\' , 26 , \'男\' );',
            'INSERT INTO people ( name , age , sex ) VALUES ( \'李四\' , 22 , \'女\' );',
        ]);
        expect(err).toBeUndefined();
    });

    test('sqliteHelper insertItems failed', async () => {
        SQLiteStorage.openDatabase.mockResolvedValue({
            sqlBatch: jest.fn(() =>
                Promise.reject(new Error('sqlBatch error'))),
        });

        const sqliteHelper = new SQLiteHelper('test.db', '1.0', 'users', 2000);
        // 无参数报错
        const { res, err } = await sqliteHelper.insertItems();
        expect(res).toBeUndefined();
        expect(err.message).toEqual('Required parameter missing');
        // 参数类型不符报错
        const { res: res1, err: err1 } = await sqliteHelper.insertItems({}, []);
        expect(res1).toBeUndefined();
        expect(err1.message).toEqual('Parameter tableName expects string but object');
        const { res: res2, err: err2 } = await sqliteHelper.insertItems(
            '1',
            '1',
        );
        expect(res2).toBeUndefined();
        expect(err2.message).toEqual('Parameter items expects array but string');
        // 执行报错
        const { res: res3, err: err3 } = await sqliteHelper.insertItems(
            '1',
            [],
        );
        expect(res3).toBeUndefined();
        expect(err3.message).toEqual('sqlBatch error');
    });
});

describe('Test instance method: deleteItem', () => {
    test('sqliteHelper deleteItem success', async () => {
        SQLiteStorage.openDatabase.mockResolvedValue({
            executeSql: jest.fn(sqlStr => Promise.resolve(sqlStr)),
        });

        const sqliteHelper = new SQLiteHelper('test.db', '1.0', 'users', 2000);
        // 有条件的删除
        const { res, err } = await sqliteHelper.deleteItem('people', {
            name: 'mike',
            age: 26,
        });
        expect(res).toEqual('DELETE FROM people WHERE name=\'mike\' AND age=26 ;');
        expect(err).toBeUndefined();
        // 无条件删除
        const { res: res1, err: err1 } = await sqliteHelper.deleteItem('people');
        expect(res1).toEqual('DELETE FROM people;');
        expect(err1).toBeUndefined();
    });

    test('sqliteHelper deleteItem failed', async () => {
        SQLiteStorage.openDatabase.mockResolvedValue({
            executeSql: jest.fn(() =>
                Promise.reject(new Error('executeSql error'))),
        });

        const sqliteHelper = new SQLiteHelper('test.db', '1.0', 'users', 2000);
        // 缺少必要参数报错
        const { res, err } = await sqliteHelper.deleteItem();
        expect(res).toBeUndefined();
        expect(err.message).toEqual('Required parameter missing');
        // 执行报错
        const { res: res1, err: err1 } = await sqliteHelper.deleteItem('people');
        expect(res1).toBeUndefined();
        expect(err1.message).toEqual('executeSql error');
    });
});

describe('Test instance method: updateItem', () => {
    test('sqliteHelper updateItem success', async () => {
        SQLiteStorage.openDatabase.mockResolvedValue({
            executeSql: jest.fn(sqlStr => Promise.resolve(sqlStr)),
        });

        const sqliteHelper = new SQLiteHelper('test.db', '1.0', 'users', 2000);
        // 有条件condition
        const { res, err } = await sqliteHelper.updateItem(
            'people',
            { name: 'Mike', age: 21 },
            { userid: 18033281, type: '01' },
        );
        expect(res).toEqual('UPDATE people SET name=\'Mike\' , age=21  WHERE userid=18033281 AND type=\'01\' ;');
        expect(err).toBeUndefined();
        // 无条件condition
        const { res: res1, err: err1 } = await sqliteHelper.updateItem(
            'people',
            { name: 'Mike', age: 21 },
        );
        expect(res1).toEqual('UPDATE people SET name=\'Mike\' , age=21 ;');
        expect(err1).toBeUndefined();
    });

    test('sqliteHelper updateItem failed', async () => {
        SQLiteStorage.openDatabase.mockResolvedValue({
            executeSql: jest.fn(() =>
                Promise.reject(new Error('updateItem error'))),
        });

        const sqliteHelper = new SQLiteHelper('test.db', '1.0', 'users', 2000);
        // 无参数错误
        const { res, err } = await sqliteHelper.updateItem();
        expect(res).toBeUndefined();
        expect(err.message).toEqual('Required parameter missing');
        // 参数类型错误1
        const { res: res1, err: err1 } = await sqliteHelper.updateItem(
            'people',
            [],
        );
        expect(res1).toBeUndefined();
        expect(err1.message).toEqual('Parameter item expects object but [object Array]');
        // 参数类型错误2
        const { res: res2, err: err2 } = await sqliteHelper.updateItem([], {});
        expect(res2).toBeUndefined();
        expect(err2.message).toEqual('Parameter tableName expects string but object');
        // 执行sql错误
        const { res: res3, err: err3 } = await sqliteHelper.updateItem(
            'people',
            {},
        );
        expect(res3).toBeUndefined();
        expect(err3.message).toEqual('updateItem error');
    });
});

describe('Test instance method: selectItems', () => {
    test('sqliteHelper selectItems success', async () => {
        SQLiteStorage.openDatabase.mockResolvedValue({
            executeSql: jest.fn(sqlStr => Promise.resolve(sqlStr)),
        });

        const sqliteHelper = new SQLiteHelper('test.db', '1.0', 'users', 2000);
        // 无条件
        const { res, err } = await sqliteHelper.selectItems('people', '*');
        expect(res).toEqual('SELECT * FROM people;');
        expect(err).toBeUndefined();
        // 某列 有条件
        const { res: res1, err: err1 } = await sqliteHelper.selectItems(
            'people',
            ['name', 'age', 'sex'],
            { age: 22 },
        );
        expect(res1).toEqual('SELECT name , age , sex  FROM people WHERE age=22 ;');
        expect(err1).toBeUndefined();
        // 某列 无条件 有页码
        const { res: res2, err: err2 } = await sqliteHelper.selectItems(
            'people',
            ['name', 'age', 'sex'],
            null,
            1,
            5,
        );
        expect(res2).toEqual('SELECT name , age , sex  FROM people limit 5 offset 0;');
        expect(err2).toBeUndefined();
        // 所有列 有条件
        const { res: res3, err: err3 } = await sqliteHelper.selectItems(
            'people',
            '*',
            { name: 'mike' },
        );
        expect(res3).toEqual('SELECT * FROM people WHERE name=\'mike\' ;');
        expect(err3).toBeUndefined();

        // 重新模拟结果
        SQLiteStorage.openDatabase.mockClear();
        SQLiteStorage.openDatabase.mockResolvedValue({
            executeSql: jest.fn(() =>
                Promise.resolve([
                    {
                        rows: {
                            length: 2,
                            item: jest.fn(i => ({
                                index: i,
                                name: 'mike',
                                age: 22,
                            })),
                        },
                    },
                ])),
        });
        const sqliteHelper1 = new SQLiteHelper('test.db', '1.0', 'users', 2000);

        const { res: res4, err: err4 } = await sqliteHelper1.selectItems(
            'people',
            '*',
        );
        expect(res4).toEqual([{'age': 22, 'index': 0, 'name': 'mike'}, {'age': 22, 'index': 1, 'name': 'mike'}]);
        expect(err4).toBeUndefined();
    });

    test('sqliteHelper selectItems failed', async () => {
        SQLiteStorage.openDatabase.mockResolvedValue({
            executeSql: jest.fn(() =>
                Promise.reject(new Error('executeSql error'))),
        });

        const sqliteHelper = new SQLiteHelper('test.db', '1.0', 'users', 2000);
        // 无参数报错
        const { res, err } = await sqliteHelper.selectItems();
        expect(res).toBeUndefined();
        expect(err.message).toEqual('Required parameter missing');
        // 参数类型报错1
        const { res: res1, err: err1 } = await sqliteHelper.selectItems(
            [],
            '*',
        );
        expect(res1).toBeUndefined();
        expect(err1.message).toEqual('Parameter tableName expects string but object');
        // 参数类型报错2
        const { res: res2, err: err2 } = await sqliteHelper.selectItems(
            'people',
            {},
        );
        expect(res2).toBeUndefined();
        expect(err2.message).toEqual('Parameter columns expects Array or \'*\' but [object Object]');
        // 执行sql报错
        const { res: res3, err: err3 } = await sqliteHelper.selectItems(
            'people',
            '*',
        );
        expect(res3).toBeUndefined();
        expect(err3.message).toEqual('executeSql error');
    });
});
