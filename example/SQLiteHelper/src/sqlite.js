import React, { PureComponent } from 'react';
import { View, Text, ScrollView } from 'react-native';
import SQLite from 'react-native-sqlite-helper';

class SQLiteExample extends PureComponent {
    constructor(props) {
        super(props);
        this.state = {
            userArray: [],
        };
        this.handleSQLite = this._handleSQLite.bind(this);
    }


    componentWillMount() {
        this.handleSQLite();
    }

    async _handleSQLite() {
        const sqLite = new SQLite('test.db', '1.0', 'users', 2000);
        // 开启数据库
        const { res: db, err: err1 } = await sqLite.open();
        // console.log(db, err1);
        // 删除db
        // const { res: res2, err: err2 } = await sqLite.delete();
        // console.log(res2, err2);
        // 关闭数据库连接
        // const { res: res3, err: err3 } = await sqLite.close();
        // console.log(res3, err3);
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
        // console.log(res4, err4);
        // 删除表
        // const { res: res5, err: err5 } = await sqLite.dropTable('people');
        // console.log(res5, err5);
        // 模拟插入数据
        const userData = [
            {
                name: '张广龙',
                age: '26',
                sex: '男',
            },
            {
                name: '张琦',
                age: '22',
                sex: '女',
            },
        ];
        // 插入数据
        const { res: res6, err: err6 } = await sqLite.insertItems('people', userData);
        // console.log(res6, err6);
        // 删除数据
        // const { res: res7, err: err7 } = await sqLite.deleteItem('people', { name: '张广龙' });
        // console.log(res7);
        // 更改数据
        // const { res: res8, err: err8 } = await sqLite.updateItem('people', { name: '张琦' }, { name: '张琦1', age: '22' });
        // console.log(res8);
        const { res: res9, err: err9 } = await sqLite.selectItems('people', '*', null);
        // console.log(res9);
        this.setState({ userArray: res9 });
    }

    render() {
        const { userArray } = this.state;
        return (
            <ScrollView>
                <Text>总共查询到{userArray.length}条数据</Text>
                {
                    userArray.length > 0 && userArray.map((item, i) => (
                        <View key={item.id}>
                            <Text>{`${item.id}、姓名：${item.name}|年龄：${item.age}|性别：${item.sex}`}</Text>
                        </View>
                    ))
                }
            </ScrollView>
        );
    }
}


export default SQLiteExample;
