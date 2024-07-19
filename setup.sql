CREATE TABLE user (
    id TEXT NOT NULL PRIMARY KEY,
    github_id INTEGER NULL NULL UNIQUE,
    username TEXT NOT NULL
);

CREATE TABLE session (
    id TEXT NOT NULL PRIMARY KEY,
    user_id TEXT NOT NULL REFERENCES user(id),
    expires_at INTEGER NOT NULL,
    login_at INTEGER NOT NULL
);