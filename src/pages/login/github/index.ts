import { generateState } from "arctic";
import { github } from "../../../lib/auth";

import type { APIContext } from "astro";

export function GET(context: APIContext): Response {
	const state = generateState();
	const url = github.createAuthorizationURL(state, []);

	context.cookies.set("github_oauth_state", state, {
		path: "/",
		httpOnly: true,
		secure: !import.meta.env.DEV,
		sameSite: "lax",
	});
	return context.redirect(url.toString());
}
