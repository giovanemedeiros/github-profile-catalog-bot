import { octokit } from "../config/octokit.js";
import type { Repository } from "../types/repository.type.js";

/**
 * Service responsible for interacting with GitHub Repositories API
 */
export async function fetchAllRepositories(): Promise<Repository[]> {

const rawRepos = await octokit.paginate(
  octokit.rest.repos.listForAuthenticatedUser,
  {
    visibility: "all",
    affiliation: "owner",
    per_page: 100,
  }
);

const repositories: Repository[] = rawRepos.map((repo) => {
  return {
    name: repo.name,
    description: repo.description,
    htmlUrl: repo.html_url,
    createdAt: repo.created_at || new Date().toISOString(),
    isPrivate: repo.private,
    isFork: repo.fork,
    isArchived: repo.archived ?? false,
    topics: repo.topics || [],
  };
});

return repositories;
}
