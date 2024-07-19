import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const userTable = sqliteTable("user", {
	id: text("id").primaryKey(),
	githubId: integer("github_id").notNull().unique(),
	username: text("username").notNull(),
});

export const sessionTable = sqliteTable("session", {
	id: text("id").primaryKey(),
	userId: text("user_id")
		.notNull()
		.references(() => userTable.id),
	expiresAt: integer("expires_at", { mode: "timestamp" }).notNull(),
	loginAt: integer("login_at", { mode: "timestamp" }).notNull(),
});
