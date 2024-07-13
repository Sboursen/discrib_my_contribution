import { Octokit } from "@octokit/rest";
import dotenv from "dotenv";

dotenv.config();

const {
  PERSONAL_ACCESS_TOKEN: ACCESS_TOKEN,
  OWNER_NAME,
  REPO_NAME
} = process.env;

const octokit = new Octokit({ auth: ACCESS_TOKEN });
const { data: { login: username } } = await octokit.rest.users.getAuthenticated();
console.log(`Hello, ${username}!`);




async function getPrTitles(username, repoOwner, repo) {
  let prTitles = [];
  let page = 1;
  let hasNextPage = true;

  while (hasNextPage && page <= 10) {
    try {
      const { data: prs } = await octokit.pulls.list({
        owner: repoOwner,
        repo: repo,
        state: 'all',
        per_page: 100,
        page: page,
      });

      if (prs.length === 0) {
        hasNextPage = false;
      } else {
        prs.forEach(pr => {
          if (pr.user.login === username) {
            prTitles.push(pr.title);
          }
        });
        page++;
      }
    } catch (error) {
      console.error(`Error fetching PRs: ${error}`);
      hasNextPage = false;
    }
  }

  return prTitles;
}

getPrTitles(username, OWNER_NAME, REPO_NAME)
  .then(prTitles => {
    prTitles.forEach(title => console.log(title));
  })
  .catch(error => {
    console.error(`Error fetching PR titles: ${error}`);
  });
