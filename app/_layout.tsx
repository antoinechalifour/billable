import { Stack } from "expo-router";
import { OPSqliteOpenFactory } from '@powersync/op-sqlite';
import { PowerSyncDatabase } from '@powersync/react-native';
import { AppSchema } from './index';

const factory = new OPSqliteOpenFactory({
    dbFilename: 'sqlite.db'
});

export const powersync = new PowerSyncDatabase({ database: factory, schema: AppSchema });

export default function RootLayout() {
  return <Stack screenOptions={{ headerShown: false }} />;
}
