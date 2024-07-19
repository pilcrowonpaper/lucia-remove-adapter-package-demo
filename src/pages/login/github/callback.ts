import { OAuth2RequestError } from "arctic";
import { createSession, github, lucia } from "../../../lib/auth";
import { db } from "../../../lib/db";
import { userTable } from "../../../lib/schema";
import { eq } from "drizzle-orm";
import { generateIdFromEntropySize } from "lucia";

import type { APIContext } from "astro";
import type { User } from "../../../lib/auth";

export async function GET(context: APIContext): Promise<Response> {
	const code = context.url.searchParams.get("code");
	const state = context.url.searchParams.get("state");
	const storedState = context.cookies.get("github_oauth_state")?.value ?? null;
	if (code === null || state === null || storedState === null) {
		return new Response(null, {
			status: 400,
		});
	}
	if (state !== storedState) {
		return new Response(null, {
			status: 400,
		});
	}
	let accessToken: string;
	try {
		const tokens = await github.validateAuthorizationCode(code);
		accessToken = tokens.accessToken();
	} catch (e) {
		if (e instanceof OAuth2RequestError) {
			console.log(e.code);
			return new Response(null, {
				status: 400,
			});
		}
		console.log(e);
		return new Response(null, {
			status: 500,
		});
	}
	const response = await fetch("https://api.github.com/user", {
		headers: {
			Authorization: `Bearer ${accessToken}`,
		},
	});
	const githubUserResult: GithubUserResult = await response.json();
	const githubUserId = githubUserResult.id;
	const githubUsername = githubUserResult.login;
	const existingUser = db.select().from(userTable).where(eq(userTable.githubId, githubUserId)).get() ?? null;
	if (existingUser !== null) {
		const session = createSession(existingUser.id);
		const sessionCookie = lucia.createSessionCookie(session.id, session.expiresAt);
		context.cookies.set(sessionCookie.name, sessionCookie.value, sessionCookie.npmCookieOptions());
		return context.redirect("/");
	}

	const user: User = {
		id: generateIdFromEntropySize(10),
		githubId: githubUserId,
		username: githubUsername,
	};
	db.insert(userTable).values(user).run();
	const session = createSession(user.id);
	const sessionCookie = lucia.createSessionCookie(session.id, session.expiresAt);
	context.cookies.set(sessionCookie.name, sessionCookie.value, sessionCookie.npmCookieOptions());
	console.log(sessionCookie.npmCookieOptions());
	return context.redirect("/");
}

interface GithubUserResult {
	id: number;
	login: string;
}
