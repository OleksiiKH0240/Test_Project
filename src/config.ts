import "dotenv/config";
import { ErrorUtility } from "try-catch-cloud";


// TryCatchCloud ENV VARIABLES
export const { PROJECT_NAME, TRY_CATCH_CLOUD_API_KEY } = process.env as { PROJECT_NAME: string, TRY_CATCH_CLOUD_API_KEY: string };
if (PROJECT_NAME === undefined || TRY_CATCH_CLOUD_API_KEY === undefined) {
    throw new Error("Some of the variables: PROJECT_NAME, TRY_CATCH_CLOUD_API_KEY are unspecified as environmental variable.")
}

export const errorTrack = new ErrorUtility(PROJECT_NAME, TRY_CATCH_CLOUD_API_KEY);

export const PORT = Number(process.env.PORT);

// DISCORD ENV VARIABLES
export const { DISCORD_TOKEN, APP_ID, PUBLIC_KEY } = process.env;

// GITHUB ENV VARIABLES
export const { GITHUB_TOKEN, GITHUB_REPO, GITHUB_REPO_OWNER } = process.env;
