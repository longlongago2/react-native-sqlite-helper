/// <reference name="SQLite" />
interface Field {
    columnName: string;
    dataType: string;
}

interface Table {
    tableName: string;
    tableFields: Array<Field>;
}

interface SQLiteProps {
    databaseName: string;
    databaseVersion: string;
    databaseDisplayName: string;
    databaseSize: number;
}

interface Result {
    res: any;
    err: Error;
}

export default class SQLite {
    constructor(props: SQLiteProps);

    successInfo: (name: string, absolutely?: boolean) => void;
    errorInfo: (name: string, err: object, absolutely?: boolean) => void;
    open: () => Result;
    close: () => Result;
    createTable: (tableInfo: Table) => Result;
    dropTable: (tableName: string) => Result;
    insertItems: (tableName: string, items: object[]) => Result;
    deleteItem: (tableName: string, condition?: object) => Result;
    updateItem: (tableName: string, item: object, condition: object) => Result;
    selectItems: (tableName: string,
                  columns: string[] | '*',
                  condition: object | null,
                  pagination?: number,
                  perPageNum?: number) => Result;

    static delete(database: string): Promise;
}