import { GITHUB_TOKEN, GITHUB_REPO, GITHUB_REPO_OWNER } from "../config";
import { Octokit } from "octokit";


const octokit = new Octokit({ auth: GITHUB_TOKEN });
const githubRepoOwner = String(GITHUB_REPO_OWNER);
const githubRepo = String(GITHUB_REPO);

class GithubService {
    createIssue = async (title: string, description: string, threadUrl: string, labels: string[]) => {
        const body = `${description}\n` + `#### [Discord Thread](${threadUrl})`;
        title = `[${labels[1].toUpperCase()}]: ` + title

        const res = await octokit.rest.issues.create({
            owner: githubRepoOwner,
            repo: githubRepo,
            title,
            labels,
            body,
        });

        // console.log(res);
        const issueUrl = res.data.html_url;
        return { issueUrl };
    }
}

export default new GithubService();
