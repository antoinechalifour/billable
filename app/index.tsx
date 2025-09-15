import { Text, View } from "react-native";
import { OPSqliteOpenFactory } from '@powersync/op-sqlite';
import {column, PowerSyncDatabase, Schema, Table} from '@powersync/react-native';

const lists = new Table({
    created_at: column.text,
    name: column.text,
    owner_id: column.text
});

const todos = new Table(
    {
        list_id: column.text,
        created_at: column.text,
        completed_at: column.text,
        description: column.text,
        created_by: column.text,
        completed_by: column.text,
        completed: column.integer
    },
    { indexes: { list: ['list_id'] } }
);

export const AppSchema = new Schema({
    todos,
    lists
});

const factory = new OPSqliteOpenFactory({
    dbFilename: 'sqlite.db'
});

const powersync = new PowerSyncDatabase({ database: factory, schema: AppSchema });

export default function Index() {
  return (
    <View
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <Text>Edit app/index.tsx to edit this screen.</Text>
    </View>
  );
}
