import { defineMiddleware } from "astro:middleware";
import { lucia } from "./lib/auth";

export const onRequest = defineMiddleware(async (context, next) => {
	const sessionId = context.cookies.get(lucia.sessionCookieName)?.value ?? null;
	if (sessionId === null) {
		context.locals.session = null;
		context.locals.user = null;
		return next();
	}
	const { session, user } = await lucia.validateSession(sessionId);
	context.locals.session = session;
	context.locals.user = user;
	if (session !== null) {
		const sessionCookie = lucia.createSessionCookie(session.id, session.expiresAt);
		context.cookies.set(sessionCookie.name, sessionCookie.value, sessionCookie.npmCookieOptions());
	} else {
		const sessionCookie = lucia.createBlankSessionCookie();
		context.cookies.set(sessionCookie.name, sessionCookie.value, sessionCookie.npmCookieOptions());
	}
	return next();
});
