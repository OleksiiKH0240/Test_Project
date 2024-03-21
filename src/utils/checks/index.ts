import { errorTrack } from "../../config";
import githubService from "../../services/GithubService";
import discordEnvVarsCheck from "./discordEnvVarsCheck";
import githubEnvVarsCheck from "./githubEnvVarsCheck";


const envVarsCheck = async () => {
    const PORT = Number(process.env.PORT);
    if (Number.isNaN(PORT)) {
        const err = new Error("PORT is unspecified as environmental variable.");

        await errorTrack.sendError(err);
        throw err;
    }

    try {
        await discordEnvVarsCheck();
        await githubEnvVarsCheck();
        await githubService.checkTokenValidity();
    }
    catch (err) {
        await errorTrack.sendError(err);
        throw err;
    }
}

export default envVarsCheck();
