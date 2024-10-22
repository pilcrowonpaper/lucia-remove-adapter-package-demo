import type { APIContext } from "astro";
import { lucia } from "../lib/auth";

export async function POST(context: APIContext): Promise<Response> {
	if (context.locals.session === null) {
		return new Response(null, {
			status: 401,
		});
	}
	await lucia.invalidateSession(context.locals.session.id);
	const sessionCookie = lucia.createBlankSessionCookie();
	context.cookies.set(sessionCookie.name, sessionCookie.value, sessionCookie.npmCookieOptions());
	return context.redirect("/");
}
