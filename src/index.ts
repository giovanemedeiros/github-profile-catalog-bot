import { fetchAllRepositories } from "./services/github.service.js";
import { sortByCreationDateDesc } from "./utils/sorter.js";
import { categorizeRepositories } from "./utils/categorizer.js";
import { generateProfileReadme, generateInventoryMarkdown } from "./services/template.service.js";
import { ensureRepositoryExists, syncFileContent } from "./services/sync.service.js";

async function main() {
  console.log("[INFO] [github-profile-catalog-bot] Initialized successfully.");
  
  try {
    const username = process.env.GITHUB_USERNAME || "giovanemedeiros";
    const rawRepos = await fetchAllRepositories();
    console.log(`[SUCCESS] Fetched ${rawRepos.length} repositories successfully.`);

    const sortedRepos = sortByCreationDateDesc(rawRepos);
    const categorized = categorizeRepositories(sortedRepos);

    // Generate Markdown documents
    const profileReadme = generateProfileReadme(categorized, username);
    const inventoryMarkdown = generateInventoryMarkdown(sortedRepos, username);

    // Remote Sync: Public Profile Repository (giovanemedeiros/giovanemedeiros)
    console.log(`\n[INFO] Starting remote sync for Public Profile (${username}/${username})...`);
    await ensureRepositoryExists(username, username, false);
    await syncFileContent({
      owner: username,
      repo: username,
      path: "README.md",
      content: profileReadme,
      commitMessage: "docs: auto update profile catalog via bot",
    });

    // Remote Sync: Private Inventory Repository (giovanemedeiros/github-profile-inventory)
    const inventoryRepoName = process.env.INVENTORY_REPO_NAME || "github-profile-inventory";
    console.log(`\n[INFO] Starting remote sync for Private Inventory (${username}/${inventoryRepoName})...`);
    await ensureRepositoryExists(username, inventoryRepoName, true);
    await syncFileContent({
      owner: username,
      repo: inventoryRepoName,
      path: "README.md",
      content: inventoryMarkdown,
      commitMessage: "docs: auto update repositories inventory via bot",
    });

    console.log("\n[SUCCESS] Full catalog bot pipeline completed successfully!");
  } catch (error) {
    console.error("[ERROR] Failed to execute catalog bot:", error);
  }
}

main();

