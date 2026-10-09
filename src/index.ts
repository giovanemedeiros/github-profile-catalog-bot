import { fetchAllRepositories } from "./services/github.service.js";
import { sortByCreationDateDesc } from "./utils/sorter.js";
import { categorizeRepositories } from "./utils/categorizer.js";
import { generateProfileReadme, generateInventoryMarkdown } from "./services/template.service.js";

async function main() {
  console.log("[INFO] [github-profile-catalog-bot] Initialized successfully.");
  
  try {
    const username = process.env.GITHUB_USERNAME || "giovanemedeiros";
    const rawRepos = await fetchAllRepositories();
    console.log(`[SUCCESS] Fetched ${rawRepos.length} repositories successfully.`);

    const sortedRepos = sortByCreationDateDesc(rawRepos);
    console.log("[INFO] Repositories sorted in reverse chronological order (newest first).");

    const categorized = categorizeRepositories(sortedRepos);

    // 1. Generate Public Profile README.md
    const profileReadme = generateProfileReadme(categorized, username);
    console.log("[INFO] Public Profile README.md generated successfully.");
    // console.log(profileReadme)

    // 2. Generate Private Complete Inventory Markdown
    const inventoryMarkdown = generateInventoryMarkdown(sortedRepos, username);
    console.log("[INFO] Private Inventory Markdown generated successfully.");
    // console.log(inventoryMarkdown)

    // Save previews to disk for direct inspection in IDE / Obsidian
    const fs = await import("fs");
    fs.writeFileSync("preview_profile_README.md", profileReadme, "utf-8");
    fs.writeFileSync("preview_inventory.md", inventoryMarkdown, "utf-8");
    console.log("[SUCCESS] Preview files created: preview_profile_README.md and preview_inventory.md");

  } catch (error) {
    console.error("[ERROR] Failed to process repositories:", error);
  }
}

main();

