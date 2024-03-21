const githubEnvVarsCheck = async () => {
    const { GITHUB_TOKEN, GITHUB_REPO, GITHUB_REPO_OWNER } = process.env;
    if (GITHUB_TOKEN === undefined || GITHUB_REPO === undefined || GITHUB_REPO_OWNER === undefined) {
        const err = new Error("Some of the variables: GITHUB_TOKEN, GITHUB_REPO, GITHUB_REPO_OWNER are unspecified as environmental variable.");
        
        throw err;
    } 
}

export default githubEnvVarsCheck;
