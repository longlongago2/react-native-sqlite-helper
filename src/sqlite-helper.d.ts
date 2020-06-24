enum Location { default = 'default', Library = 'Library', Documents = 'Documents', Shared = 'Shared' }

interface SQLiteObjectProps {
  name: string;
  location?: Location; // just ios
  createFromLocation?: string | number; // pre-populated database
  readOnly?: boolean; // pre-populated database
}

interface Field {
  columnName: string;
  dataType: string;
}

interface Table {
  tableName: string;
  tableFields: Array<Field>;
}

interface Result {
  res: any;
  err: Error | undefined;
}

interface Config {
  columns: string | string[];
  conditions?: string | Conditions | Array<Condition>;
  pageNo?: number;
  pageLength?: number;
}

interface Condition {
  columnName: string,
  value: number | string,
  operator?: string,
}

interface Conditions {
  combine?: string,
  conditions: Array<Condition>,
}

export default class SQLite {
  static delete(databaseName: string): Result;

  // overload 重载
  constructor(databaseName: string, databaseVersion: string, databaseDisplayName: string, databaseSize?: number);
  constructor(database: SQLiteObjectProps);

  successInfo(text: string, absolutely?: boolean): void;
  warnInfo(text: string, absolutely?: boolean): void;
  errorInfo(text: string, err: object, absolutely?: boolean): void;
  open(): Result;
  close(): Result;
  createTable(tableInfo: Table): Result;
  dropTable(tableName: string): Result;
  insertItems(tableName: string, items: object[]): Result;
  deleteItem(tableName: string, conditions?: string | Conditions | Array<Condition>): Result;
  updateItem(tableName: string, item: object, conditions?: string | Conditions | Array<Condition>): Result;
  selectItems(tableName: string, config: Config): Result;
}
