// import { OPSqliteOpenFactory } from "@powersync/op-sqlite";
import { PowerSyncDatabase } from "@powersync/react-native";
import { sqliteTable, text } from "drizzle-orm/sqlite-core";
import {
  DrizzleAppSchema,
  wrapPowerSyncWithDrizzle,
} from "@powersync/drizzle-driver";
import { SQLJSOpenFactory } from "@powersync/adapter-sql-js";

export const clients = sqliteTable("clients", {
  id: text().primaryKey().notNull(),
  name: text(),
  color: text(),
});

const factory = new SQLJSOpenFactory({
  dbFilename: "sqlite.db",
});
// const factory = new OPSqliteOpenFactory({
//   dbFilename: "sqlite.db",
// });

const drizzleSchema = {
  clients,
  // clients: {
  //   tableDefinition: clients,
  //   options: { localOnly: true },
  // },
};
const AppSchema = new DrizzleAppSchema(drizzleSchema);

export const powersync = new PowerSyncDatabase({
  database: factory,
  schema: AppSchema,
});

export const db = wrapPowerSyncWithDrizzle(powersync, {
  schema: drizzleSchema,
});
