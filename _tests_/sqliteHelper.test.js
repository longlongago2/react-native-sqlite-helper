import SQLiteStorage from 'react-native-sqlite-storage';
import SQLiteHelper from '../sqliteHelper';

__DEV__ = false;

jest.mock('react-native-sqlite-storage'); // 模拟sqliteHelper.js中的依赖模块

// TODO: 多层then回调 coverage检测不到代码覆盖率，then只能检测到一层回调，所以多层then回调的统一使用 async/await

describe('Test instance method: open()', () => {
    test('sqliteHelper open sqlite database success', () => {
        const sqliteHelper = new SQLiteHelper('test.db', '1.0', 'users', 2000);
        SQLiteStorage.openDatabase.mockResolvedValue('open success'); // 模拟open方法中使用到的依赖方法
        sqliteHelper.open().then(({ res, err }) => {
            expect(res).toEqual('open success');
            expect(err).toEqual(undefined);
        });
    });

    test('sqliteHelper open sqlite database failed', () => {
        const sqliteHelper = new SQLiteHelper('test.db', '1.0', 'users', 2000);
        SQLiteStorage.openDatabase.mockRejectedValue(new Error('open failed'));
        sqliteHelper.open().then(({ res, err }) => {
            expect(err.message).toEqual('open failed');
            expect(res).toEqual(undefined);
        });
    });
});

describe('Test static method: delete()', () => {
    test('sqliteHelper delete sqlite database success', () => {
        SQLiteStorage.deleteDatabase = jest.fn(database =>
            Promise.resolve(database)); // 模拟deleteDatabase静态方法

        SQLiteHelper.delete('test.db').then(({ res, err }) => {
            expect(res).toEqual('test.db');
            expect(err).toEqual(undefined);
        });
    });

    test('sqliteHelper delete sqlite database failed', () => {
        SQLiteStorage.deleteDatabase = jest.fn(database =>
            Promise.reject(new Error(`delete ${database} error`)));

        SQLiteHelper.delete('test.db').then(({ res, err }) => {
            expect(err.message).toEqual('delete test.db error');
            expect(res).toEqual(undefined);
        });
    });
});

describe('Test instance method: close()', () => {
    test('sqliteHelper close sqlite database success', async () => {
        const sqliteHelper = new SQLiteHelper('test.db', '1.0', 'users', 2000);

        SQLiteStorage.openDatabase.mockResolvedValue({
            close: jest.fn(() => Promise.resolve()),
        });

        // 不存在this.db：没有实例化
        sqliteHelper.close().then((res) => {
            expect(res).toEqual(true);
        });

        // 存在this.db：找到实例，证明已经open，可以执行关闭
        await sqliteHelper.open();
        const { res, err } = await sqliteHelper.close();

        // res 和 err 同时只能有一个值存在，另一个为undefined
        expect(res).toEqual(['database was closed']);
        expect(err).toEqual(undefined);
    });

    test('sqliteHelper close sqlite database failed', async () => {
        const sqliteHelper = new SQLiteHelper('test.db', '1.0', 'users', 2000);

        SQLiteStorage.openDatabase.mockResolvedValue({
            close: jest.fn(() => Promise.reject(new Error('close failed'))),
        });

        sqliteHelper.close().then((res) => {
            expect(res).toEqual(true);
        });

        await sqliteHelper.open();
        const { res, err } = await sqliteHelper.close();
        expect(err.message).toEqual('close failed');
        expect(res).toEqual(undefined);
    });
});
