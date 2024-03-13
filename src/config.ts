import "dotenv/config";


export const PORT = Number(process.env.PORT);
if (Number.isNaN(PORT)) {
    throw new Error("PORT is unspecified as environmental variable.")
}

// DISCORD ENV VARIABLES
export const { DISCORD_TOKEN, APP_ID, PUBLIC_KEY } = process.env;
if (DISCORD_TOKEN === undefined || APP_ID === undefined || PUBLIC_KEY === undefined) {
    throw new Error("Some of the variables: DISCORD_TOKEN, APP_ID, PUBLIC_KEY are unspecified as environmental variable.")
}

// GITHUB ENV VARIABLES
export const { GITHUB_TOKEN, GITHUB_REPO, GITHUB_REPO_OWNER } = process.env;
if (GITHUB_TOKEN === undefined || GITHUB_REPO === undefined || GITHUB_REPO_OWNER === undefined) {
    throw new Error("Some of the variables: GITHUB_TOKEN, GITHUB_REPO, GITHUB_REPO_OWNER are unspecified as environmental variable.")
}
