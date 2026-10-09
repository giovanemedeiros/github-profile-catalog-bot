import { Octokit } from "@octokit/rest";
import dotenv from "dotenv";

dotenv.config();

const token = process.env.GITHUB_TOKEN;

if (!token || token === "ghp_your_token_here" || token === "ghp_seu_token_real_aqui") {
  throw new Error(
    "[CONFIG ERROR] GITHUB_TOKEN is not defined or is still a placeholder in .env file. Please set a valid GitHub Personal Access Token."
  );
}

export const octokit: Octokit = new Octokit({
  auth: token,
});
