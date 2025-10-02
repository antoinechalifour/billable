// import { OPSqliteOpenFactory } from "@powersync/op-sqlite";
import {
  AbstractPowerSyncDatabase,
  CrudEntry,
  PowerSyncBackendConnector,
  PowerSyncCredentials,
  PowerSyncDatabase,
  UpdateType,
} from "@powersync/react-native";
import { sqliteTable, text } from "drizzle-orm/sqlite-core";
import {
  DrizzleAppSchema,
  wrapPowerSyncWithDrizzle,
} from "@powersync/drizzle-driver";
import { SQLJSOpenFactory } from "@powersync/adapter-sql-js";
import { SupabaseClient } from "@supabase/supabase-js";

export const clients = sqliteTable("clients", {
  id: text().primaryKey().notNull(),
  name: text().notNull(),
  color: text().notNull(),
  user_id: text().notNull(),
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

const FATAL_RESPONSE_CODES = [
  // Class 22 — Data Exception
  // Examples include data type mismatch.
  new RegExp("^22...$"),
  // Class 23 — Integrity Constraint Violation.
  // Examples include NOT NULL, FOREIGN KEY and UNIQUE violations.
  new RegExp("^23...$"),
  // INSUFFICIENT PRIVILEGE - typically a row-level security violation
  new RegExp("^42501$"),
];

export class Connector implements PowerSyncBackendConnector {
  constructor(private readonly supabaseClient: SupabaseClient) {}

  async fetchCredentials(): Promise<PowerSyncCredentials | null> {
    const {
      data: { session },
      error,
    } = await this.supabaseClient.auth.getSession();

    if (!session || error) {
      throw new Error(`Could not fetch Supabase credentials: ${error}`);
    }

    console.debug("session expires at", session.expires_at);

    return {
      endpoint: "https://68dc40265301d4cd91aea3ea.powersync.journeyapps.com",
      token: session.access_token ?? "",
    } satisfies PowerSyncCredentials;
  }

  async uploadData(database: AbstractPowerSyncDatabase): Promise<void> {
    const transaction = await database.getNextCrudTransaction();

    if (!transaction) return;

    let lastOp: CrudEntry | null = null;
    try {
      // Note: If transactional consistency is important, use database functions
      // or edge functions to process the entire transaction in a single call.
      for (const op of transaction.crud) {
        lastOp = op;
        const table = this.supabaseClient.from(op.table);
        let result: any;
        switch (op.op) {
          case UpdateType.PUT: {
            const record = { ...op.opData, id: op.id };
            result = await table.upsert(record);
            break;
          }
          case UpdateType.PATCH:
            result = await table.update(op.opData).eq("id", op.id);
            break;
          case UpdateType.DELETE:
            result = await table.delete().eq("id", op.id);
            break;
        }

        if (result.error) {
          console.error(result.error);
          result.error.message = `Could not update Supabase. Received error: ${result.error.message}`;
          throw result.error;
        }
      }

      await transaction.complete();
    } catch (ex: any) {
      console.debug(ex);
      if (
        typeof ex.code == "string" &&
        FATAL_RESPONSE_CODES.some((regex) => regex.test(ex.code))
      ) {
        /**
         * Instead of blocking the queue with these errors,
         * discard the (rest of the) transaction.
         *
         * Note that these errors typically indicate a bug in the application.
         * If protecting against data loss is important, save the failing records
         * elsewhere instead of discarding, and/or notify the user.
         */
        console.error("Data upload error - discarding:", lastOp, ex);
        await transaction.complete();
      } else {
        // Error may be retryable - e.g. network error or temporary server error.
        // Throwing an error here causes this call to be retried after a delay.
        throw ex;
      }
    }
  }
}
