import React, { PureComponent } from 'react';
import { View, Text, Button, ScrollView, TextInput } from 'react-native';
import SQLite from 'react-native-sqlite-helper';

const sqLite = new SQLite('test.db', '1.0', 'users', 2000);

class Index extends PureComponent {
    constructor(props) {
        super(props);
        this.state = {
            consoleText: 'console loaded\n',
            sqlStr: '',
        };
        this.handleOpen = this._handleOpen.bind(this);
        this.handleClose = this._handleClose.bind(this);
        this.handleDelete = this._handleDelete.bind(this);
        this.handleCreateTable = this._handleCreateTable.bind(this);
        this.handleDropTable = this._handleDropTable.bind(this);
        this.handleInsertItems = this._handleInsertItems.bind(this);
        this.handleUpdateItem = this._handleUpdateItem.bind(this);
        this.handleSelectItems = this._handleSelectItems.bind(this);
        this.handleConsoleLog = this._handleConsoleLog.bind(this);
        this.handleExecuteSQL = this._handleExecuteSQL.bind(this);
    }

    _handleConsoleLog(res, err, successInfo, errorInfo) {
        res && this.setState((prevState) => {
            const { consoleText } = prevState;
            return { consoleText: consoleText + `${successInfo}\n` };
        }, () => this.consolePanel.scrollToEnd({ animated: true }));
        err && this.setState((prevState) => {
            const { consoleText } = prevState;
            return { consoleText: consoleText + `${errorInfo}\n` };
        }, () => this.consolePanel.scrollToEnd({ animated: true }));
    }

    async _handleOpen() {
        // 开启数据库
        const { res, err } = await sqLite.open();
        if (res) {
            this.db = res;
        }
        this.handleConsoleLog(res, err, 'database已经打开！', 'database打开失败！');
    }

    async _handleClose() {
        // 关闭数据库连接
        const { res, err } = await sqLite.close();
        if (res) {
            this.db = null;
        }
        this.handleConsoleLog(res, err, 'database已经关闭！', 'database关闭失败！');
    }

    async _handleDelete() {
        // 删除db
        const { res, err } = await SQLite.delete('test.db').then(res => ({ res })).catch(err => ({ err }));
        this.handleConsoleLog(res, err, 'database已删除！', 'database删除失败！');
    }

    async _handleCreateTable() {
        // 建表
        if (!this.db) return;
        const { res, err } = await sqLite.createTable({
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
        this.handleConsoleLog(res, err, 'people表创建成功！', 'people表创建失败！');
    }

    async _handleDropTable() {
        // 删除表
        if (!this.db) return;
        const { res, err } = await sqLite.dropTable('people');
        this.handleConsoleLog(res, err, 'people表已删除！', 'people表删除失败！');
    }

    async _handleInsertItems() {
        // 模拟插入数据
        if (!this.db) return;
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
        const { res, err } = await sqLite.insertItems('people', userData);
        this.handleConsoleLog(res, err, '插入2条数据！', '插入数据失败！');
    }

    async _handleUpdateItem() {
        // 更改数据
        if (!this.db) return;
        const { res, err } = await sqLite.updateItem('people', { name: '张琦1' }, { name: '张琦', age: '22' });
        this.handleConsoleLog(res, err, '更改数据成功！', '更改数据失败！');
    }

    async _handleSelectItems() {
        // 查询数据
        if (!this.db) return;
        const { res, err } = await sqLite.selectItems('people', '*', null);
        let consoleText = `本次供查询到${res.length}条数据\n`;
        consoleText += res.length > 0 && res.map((item) => (
            `${item.id}、姓名：${item.name}|年龄：${item.age}|性别：${item.sex}`
        ));
        this.handleConsoleLog(res, err, consoleText.toString().replace(/,/g, '\n'), '查询数据失败');
    }

    async _handleExecuteSQL(sqlStr) {
        let result = {};
        // 对于复杂sql语句，参数化的执行sql方法并不支持，可以直接使用executeSql
        await this.db.executeSql(sqlStr)
            .then((res) => {
                result = { res };
            })
            .catch((err) => {
                result = { err };
            });
        const { res, err } = result;
        let consoleText = `正在执行sql语句：${sqlStr}\n`;
        consoleText += `执行结果：${JSON.stringify(res)}\n`;
        const queryResult = [];
        const len = res[0].rows.length;
        for (let i = 0; i < len; i++) {
            queryResult.push(res[0].rows.item(i));
        }
        consoleText += queryResult.length > 0 && queryResult.map((item) => (
            `${item.id}、姓名：${item.name}|年龄：${item.age}|性别：${item.sex}\n`
        ));
        this.handleConsoleLog(res, err, consoleText, '执行sql语句失败！');
    }

    render() {
        return (
            <View style={{ flex: 1, padding: 5, margin: 0 }}>
                <View style={{ flex: -1, height: 135, flexDirection: 'row', flexWrap: 'wrap' }}>
                    <View style={{ width: 100, margin: 5 }}>
                        <Button title="打开数据库" onPress={this.handleOpen} />
                    </View>
                    <View style={{ width: 100, margin: 5 }}>
                        <Button title="关闭数据库" onPress={this.handleClose} />
                    </View>
                    <View style={{ width: 100, margin: 5 }}>
                        <Button title="删除数据库" onPress={this.handleDelete} />
                    </View>
                    <View style={{ width: 100, margin: 5 }}>
                        <Button title="创建表" onPress={this.handleCreateTable} />
                    </View>
                    <View style={{ width: 100, margin: 5 }}>
                        <Button title="删除表" onPress={this.handleDropTable} />
                    </View>
                    <View style={{ width: 100, margin: 5 }}>
                        <Button title="插入数据" onPress={this.handleInsertItems} />
                    </View>
                    <View style={{ width: 100, margin: 5 }}>
                        <Button title="更改数据" onPress={this.handleUpdateItem} />
                    </View>
                    <View style={{ width: 100, margin: 5 }}>
                        <Button title="查询数据" onPress={this.handleSelectItems} />
                    </View>
                </View>
                <View
                    style={{
                        flex: -1,
                        height: 50,
                        flexDirection: 'row',
                    }}
                >
                    <View style={{ width: 100, margin: 5 }}>
                        <Button title="执行sql" onPress={() => this.handleExecuteSQL(this.state.sqlStr)} />
                    </View>
                    <TextInput style={{ flex: 1 }} onChangeText={(text) => this.setState({ sqlStr: text })} />
                </View>
                <View
                    style={{
                        flex: -1,
                        height: 50,
                        flexDirection: 'row',
                    }}
                >
                    <View style={{ width: 100, margin: 5 }}>
                        <Button title="清屏" color="red" onPress={() => this.setState({ consoleText: 'clear\n' })} />
                    </View>
                </View>
                <ScrollView
                    ref={(ref) => {
                        this.consolePanel = ref;
                    }}>
                    <Text>{this.state.consoleText}</Text>
                </ScrollView>
            </View>
        );
    }
}

export default Index;
