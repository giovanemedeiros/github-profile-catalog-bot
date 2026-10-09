import { fetchAllRepositories } from "./services/github.service.js";

async function main() {
  console.log("[INFO] [github-profile-catalog-bot] Initialized successfully.");
  
  try {
    const repos = await fetchAllRepositories();
    console.log(`[SUCCESS] Fetched ${repos.length} repositories successfully.`);
    console.table(
      repos.map((r) => ({
        Name: r.name,
        Private: r.isPrivate,
        Fork: r.isFork,
        Archived: r.isArchived,
        Topics: r.topics.join(", ") || "(none)",
      }))
    );
  } catch (error) {
    console.error("[ERROR] Failed to fetch repositories:", error);
  }
}

main();

