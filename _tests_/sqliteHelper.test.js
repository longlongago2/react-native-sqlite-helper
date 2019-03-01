import SQLiteStorage from 'react-native-sqlite-storage';
import SQLiteHelper from '../sqliteHelper';

__DEV__ = false;

jest.mock('react-native-sqlite-storage'); // 模拟sqliteHelper.js中的依赖模块

describe('Test instance method: open()', () => {
    test('sqliteHelper open sqlite database success', () => {
        const sqliteHelper = new SQLiteHelper('test.db', '1.0', 'users', 2000);
        SQLiteStorage.openDatabase.mockResolvedValue('open success'); // 模拟open方法中使用到的依赖方法
        sqliteHelper.open().then(({ res, err }) => {
            expect(res).toEqual('open success');
        });
    });

    test('sqliteHelper open sqlite database failed', () => {
        const sqliteHelper = new SQLiteHelper('test.db', '1.0', 'users', 2000);
        SQLiteStorage.openDatabase.mockRejectedValue(new Error('open failed'));
        sqliteHelper.open().then(({ res, err }) => {
            expect(err.message).toEqual('open failed');
        });
    });
});

describe('Test static method: delete()', () => { 
    test('sqliteHelper delete sqlite database success', () => { 
        SQLiteHelper.delete = jest.fn(database => Promise.resolve(database)); // 模拟delete静态方法
        SQLiteHelper.delete('test.db').then(({ res, err }) => { 
            expect(res).toEqual('test.db');
        })
    });

    test('sqliteHelper delete sqlite database failed', () => { 
        SQLiteHelper.delete = jest.fn(database => Promise.reject(new Error('error'))); // 模拟delete静态方法
        SQLiteHelper.delete('test.db').then(({ res, err }) => { 
            expect(err.message).toEqual('error');
        })
    });
});
