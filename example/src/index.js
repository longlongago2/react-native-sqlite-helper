import React, {PureComponent} from 'react';
import {View, Text, Button, ScrollView, TextInput} from 'react-native';
import SQLiteHelper from '../lib/sqlite-helper';

// SQLiteHelper 执行实例方法之前不用手动打开open（自动检测并打开），而直接使用SQLite实例执行sql，需要手动打开
const sqliteH = new SQLiteHelper('test.db', '1.0', 'users', 2000);

class Index extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      consoleText: 'sqlite is ready.\nconsole loaded.',
      sqlStr: '',
    };
    this.consolePanel = React.createRef();
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
    res &&
      this.setState(
        prevState => {
          const {consoleText} = prevState;
          return {consoleText: `${consoleText}\n${successInfo}`};
        },
        () => requestAnimationFrame(() => this.consolePanel.current.scrollToEnd({animated: true})),
      );
    err &&
      this.setState(
        prevState => {
          const resolveErrorInfo = `${errorInfo}:${err.message}`;
          const {consoleText} = prevState;
          return {consoleText: `${consoleText}\n${resolveErrorInfo}`};
        },
        () => requestAnimationFrame(() => this.consolePanel.current.scrollToEnd({animated: true})),
      );
  }

  async _handleOpen() {
    // 开启数据库
    const {res, err} = await sqliteH.open();
    if (res) {
      this.sqlite = res; // todo: res是SQLite的实例，可以直接执行sql
    }
    this.handleConsoleLog(res, err, 'database已经打开！', 'database打开失败');
  }

  async _handleClose() {
    // 关闭数据库连接
    const {res, err} = await sqliteH.close();
    if (res) {
      this.sqlite = null;
    }
    this.handleConsoleLog(res, err, 'database已经关闭！', 'database关闭失败！');
  }

  async _handleDelete() {
    // 删除db
    const {res, err} = await SQLiteHelper.delete('test.db');
    this.handleConsoleLog(res, err, 'database已删除！', 'database删除失败！');
  }

  async _handleCreateTable() {
    // 建表
    const {res, err} = await sqliteH.createTable({
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
          dataType: 'varchar',
        },
        {
          columnName: 'sex',
          dataType: 'varchar',
        },
      ],
    });
    this.handleConsoleLog(res, err, 'people表创建成功！', 'people表创建失败！');
  }

  async _handleDropTable() {
    // 删除表
    const {res, err} = await sqliteH.dropTable('people');
    this.handleConsoleLog(res, err, 'people表已删除！', 'people表删除失败！');
  }

  async _handleInsertItems() {
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
    const {res, err} = await sqliteH.insertItems('people', userData);
    this.handleConsoleLog(res, err, '插入2条数据！', '插入数据失败！');
  }

  async _handleUpdateItem() {
    // 更改数据
    const { res, err } = await sqliteH.updateItem('people', { age: '100' }, [
      {
        columnName: 'name',
        value: '张琦',
      },
      {
        columnName: 'age',
        value: '22',
      },
    ]);
    this.handleConsoleLog(res, err, '更改数据成功！', '更改数据失败！');
  }

  async _handleSelectItems() {
    // 查询数据
    const {res, err} = await sqliteH.selectItems('people', {columns: '*'});
    if (!Array.isArray(res)) {
      return;
    }
    let consoleText = `本次供查询到${res.length}条数据\n`;
    consoleText += res.length > 0 && res.map(item => `${item.id}、姓名：${item.name}|年龄：${item.age}|性别：${item.sex}\n`);
    this.handleConsoleLog(res, err, consoleText.toString().replace(/,/g, '\n'), '查询数据失败');
  }

  async _handleExecuteSQL(sqlStr) {
    if (!this.sqlite) {
      // 使用原始的SQLite类执行sql，需要手动打开
      await this.handleOpen();
    }
    // 对于复杂sql语句，参数化的执行sql方法并不支持，可以直接使用executeSql
    const result = await this.sqlite
      .executeSql(sqlStr)
      .then(res => ({res}))
      .catch(err => ({err}));
    const {res, err} = result;
    let consoleText = `正在执行sql语句：${sqlStr}\n`;
    consoleText += `执行结果：\n查询到${res[0].rows.length}行\n影响了${res[0].rowsAffected}行\n`;
    const queryResult = [];
    if (res[0].rows.length > 0) {
      const len = res[0].rows.length;
      for (let i = 0; i < len; i++) {
        queryResult.push(res[0].rows.item(i));
      }
      consoleText +=
        queryResult.length > 0 &&
        queryResult
          .map(item => `${item.id}、姓名：${item.name}|年龄：${item.age}|性别：${item.sex}\n`)
          .toString()
          .replace(/,/g, '\n');
    }
    this.handleConsoleLog(res, err, consoleText, '执行sql语句失败！');
    await this.handleClose(); // todo: 需要手动关闭
  }

  render() {
    return (
      <View style={{flex: 1, flexDirection: 'column', padding: 5, margin: 0}}>
        <View style={{flex: -1, height: 135, flexDirection: 'row', flexWrap: 'wrap'}}>
          <View style={{width: 100, margin: 5}}>
            <Button title="打开数据库" onPress={this.handleOpen} />
          </View>
          <View style={{width: 100, margin: 5}}>
            <Button title="创建表" onPress={this.handleCreateTable} />
          </View>
          <View style={{width: 100, margin: 5}}>
            <Button title="插入数据" onPress={this.handleInsertItems} />
          </View>
          <View style={{width: 100, margin: 5}}>
            <Button title="查询数据" onPress={this.handleSelectItems} />
          </View>
          <View style={{width: 100, margin: 5}}>
            <Button title="更改数据" onPress={this.handleUpdateItem} />
          </View>
          <View style={{width: 100, margin: 5}}>
            <Button title="重新查数据" onPress={this.handleSelectItems} />
          </View>
          <View style={{width: 100, margin: 5}}>
            <Button title="关闭数据库" onPress={this.handleClose} />
          </View>
          <View style={{width: 100, margin: 5}}>
            <Button title="删除表" onPress={this.handleDropTable} />
          </View>
          <View style={{width: 100, margin: 5}}>
            <Button title="删除数据库" onPress={this.handleDelete} />
          </View>
        </View>
        <View style={{flex: -1, height: 50, flexDirection: 'row'}}>
          <TextInput
            style={{
              flex: 1,
              borderBottomWidth: 1,
              borderBottomColor: '#ccc',
              height: 40,
              lineHeight: 1,
              fontSize: 15,
            }}
            onChangeText={text => this.setState({sqlStr: text})}
          />
          <View style={{width: 100, margin: 5}}>
            <Button title="执行sql" onPress={() => this.handleExecuteSQL(this.state.sqlStr)} />
          </View>
        </View>
        <View style={{flex: -1, height: 50, flexDirection: 'row'}}>
          <View style={{width: 100, margin: 5}}>
            <Button title="清屏" color="red" onPress={() => this.setState({consoleText: 'console cleared\n'})} />
          </View>
        </View>
        <ScrollView style={{flex: 1}} ref={this.consolePanel}>
          <Text>{this.state.consoleText}</Text>
        </ScrollView>
      </View>
    );
  }
}

export default Index;
