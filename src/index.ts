import { fetchAllRepositories } from "./services/github.service.js";
import { sortByCreationDateDesc } from "./utils/sorter.js";
import { categorizeRepositories } from "./utils/categorizer.js";

async function main() {
  console.log("[INFO] [github-profile-catalog-bot] Initialized successfully.");
  
  try {
    const rawRepos = await fetchAllRepositories();
    console.log(`[SUCCESS] Fetched ${rawRepos.length} repositories successfully.`);

    const sortedRepos = sortByCreationDateDesc(rawRepos);
    console.log("[INFO] Repositories sorted in reverse chronological order (newest first).");

    const categorized = categorizeRepositories(sortedRepos);
    console.log("[INFO] Categorization summary:");

    for (const [category, repos] of Object.entries(categorized)) {
      console.log(`- ${category}: ${repos.length} repository(ies)`);
    }

    console.table(
      sortedRepos.map((r) => ({
        Name: r.name,
        "Created At": r.createdAt.substring(0, 10),
        Private: r.isPrivate,
        Fork: r.isFork,
        Archived: r.isArchived,
        Topics: r.topics.join(", ") || "(none)",
      }))
    );
  } catch (error) {
    console.error("[ERROR] Failed to process repositories:", error);
  }
}

main();

