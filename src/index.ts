import { octokit } from "./config/octokit.js";

async function main() {
  console.log("[INFO] [github-profile-catalog-bot] Initialized successfully.");
  
  try {
    const { data: user } = await octokit.rest.users.getAuthenticated();
    console.log(`[SUCCESS] Authenticated successfully as: ${user.login} (${user.name || "No public name"})`);
    console.log(`[INFO] Public Repos: ${user.public_repos} | Total Private Repos: ${user.total_private_repos ?? "N/A"}`);
  } catch (error) {
    console.error("[ERROR] Failed to authenticate with GitHub API:", error);
  }
}

main();
