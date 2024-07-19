import { generateSessionId, Lucia } from "lucia";
import { userTable, sessionTable } from "./schema";
import { eq } from "drizzle-orm";
import { db } from "./db";
import { GitHub } from "arctic";

import type { DatabaseAdapter, SessionAndUser } from "lucia";
import type { InferSelectModel } from "drizzle-orm";

const adapter: DatabaseAdapter<Session, User> = {
	getSessionAndUser: async (sessionId: string): Promise<SessionAndUser<Session, User>> => {
		const result =
			db
				.select({
					user: userTable,
					session: sessionTable,
				})
				.from(sessionTable)
				.innerJoin(userTable, eq(sessionTable.userId, userTable.id))
				.where(eq(sessionTable.id, sessionId))
				.get() ?? null;
		if (result === null) {
			return { session: null, user: null };
		}
		return result;
	},
	deleteSession: async (sessionId: string): Promise<void> => {
		db.delete(sessionTable).where(eq(sessionTable.id, sessionId)).run();
	},
	updateSessionExpiration: async (sessionId: string, expiresAt: Date): Promise<void> => {
		db.update(sessionTable)
			.set({
				expiresAt,
			})
			.where(eq(sessionTable.id, sessionId))
			.run();
	},
};

export const lucia = new Lucia(adapter, {
	secureCookies: !import.meta.env.DEV,
});

export const github = new GitHub(import.meta.env.GITHUB_CLIENT_ID, import.meta.env.GITHUB_CLIENT_SECRET, null);

export function createSession(userId: string): Session {
	const session: Session = {
		id: generateSessionId(),
		userId: userId,
		expiresAt: lucia.getNewSessionExpiration(),
		loginAt: new Date(),
	};
	db.insert(sessionTable).values(session).run();
	return session;
}

export type User = InferSelectModel<typeof userTable>;
export type Session = InferSelectModel<typeof sessionTable>;
