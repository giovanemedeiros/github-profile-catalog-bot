import type { Repository } from "../types/repository.type.js";

/**
 * Sorts an array of repositories in reverse chronological order (newest first) based on createdAt date.
 * Creates a shallow copy to preserve immutability.
 */
export function sortByCreationDateDesc(repositories: Repository[]): Repository[] {
  return [...repositories].sort((a, b) => {
    const timeA = new Date(a.createdAt).getTime();
    const timeB = new Date(b.createdAt).getTime();
    return timeB - timeA;
  });
}
