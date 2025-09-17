import { Redirect } from "expo-router";
import { column, Schema, Table } from "@powersync/react-native";

const clients = new Table({
  id: column.text,
  name: column.text,
  color: column.text,
  daily_rate: column.real,
  created_at: column.text,
  updated_at: column.text,
});

const time_entries = new Table(
  {
    id: column.text,
    client_id: column.text,
    date: column.text,
    duration_type: column.text, // 'full_day' or 'half_day'
    notes: column.text,
    created_at: column.text,
    updated_at: column.text,
  },
  { indexes: { client: ["client_id"], date: ["date"] } },
);

export const AppSchema = new Schema({
  clients,
  time_entries,
});

export default function Index() {
  return <Redirect href="/(tabs)/calendar" />;
}
