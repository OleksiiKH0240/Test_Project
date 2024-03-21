import { GITHUB_TOKEN, GITHUB_REPO, GITHUB_REPO_OWNER, errorTrack } from "../config";
import { Octokit } from "octokit";


const octokit = new Octokit({ auth: GITHUB_TOKEN });
const githubRepoOwner = String(GITHUB_REPO_OWNER);
const githubRepo = String(GITHUB_REPO);

class GithubService {
    checkTokenValidity = async () => {
        const res = await fetch(`https://api.github.com/repos/${githubRepoOwner}/${githubRepo}/issues`, {
            headers: {
                "Accept": "application/vnd.github+json",
                "Authorization": `Bearer ${GITHUB_TOKEN}`,
                "X-GitHub-Api-Version": "2022-11-28"
            }
        });

        if (!res.ok) {
            const data = {...(await res.json()), statusCode: res.status};
            const error = new Error(JSON.stringify(data))

            await errorTrack.sendError(error);
            throw error;
        }
    }

    createIssue = async (title: string, description: string, threadUrl: string, labels: string[]) => {
        const body = `${description}\n` + `#### [Discord Thread](${threadUrl})`;
        title = `[${labels[1].toUpperCase()}]: ` + title;

        const { data } = await octokit.rest.issues.create({
            owner: githubRepoOwner,
            repo: githubRepo,
            title,
            labels,
            body
        });

        const issueUrl = data.html_url;
        return { issueUrl };
    }
}

export default new GithubService();
