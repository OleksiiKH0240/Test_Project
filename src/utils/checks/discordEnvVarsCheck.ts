const discordEnvVarsCheck = async () => {
    const { DISCORD_TOKEN, APP_ID, PUBLIC_KEY } = process.env;
    if (DISCORD_TOKEN === undefined || APP_ID === undefined || PUBLIC_KEY === undefined) {
        const err = new Error("Some of the variables: DISCORD_TOKEN, APP_ID, PUBLIC_KEY are unspecified as environmental variable.");

        throw err;
    }
}

export default discordEnvVarsCheck;
