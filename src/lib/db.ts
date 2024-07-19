import { drizzle } from "drizzle-orm/better-sqlite3";
import Database from "better-sqlite3";
import { sessionTable, userTable } from "./schema";

const sqlite = new Database("sqlite.db");

export const db = drizzle(sqlite, {
	schema: {
		users: userTable,
		sessions: sessionTable,
	},
});
