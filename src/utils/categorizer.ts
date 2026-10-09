import type { Repository } from "../types/repository.type.js";
import type { Category, CategorizedRepositories } from "../types/category.type.js";

const TAG_TO_CATEGORY_MAP: Record<string, Category> = {
  qa: "QA & Automação de Testes",
  rpa: "RPA & Automação de Processos",
  "front-end": "Desenvolvimento Front-End",
  "back-end": "Desenvolvimento Back-End",
  "full-stack": "Desenvolvimento Full-Stack",
};

/**
 * Identifies the category of a repository based strictly on its topics.
 * If no matching topic is found, returns 'Outros Projetos'.
 */
export function identifyCategory(topics: string[]): Category {
  const normalizedTopics = topics.map((t) => t.toLowerCase().trim());

  for (const topic of normalizedTopics) {
    const matchedCategory = TAG_TO_CATEGORY_MAP[topic];
    if (matchedCategory) {
      return matchedCategory;
    }
  }

  return "Outros Projetos";
}

/**
 * Groups an array of sorted repositories into categorized buckets.
 * Preserves the existing sort order within each category.
 */
export function categorizeRepositories(repositories: Repository[]): CategorizedRepositories {
  const grouped: CategorizedRepositories = {
    "QA & Automação de Testes": [],
    "RPA & Automação de Processos": [],
    "Desenvolvimento Front-End": [],
    "Desenvolvimento Back-End": [],
    "Desenvolvimento Full-Stack": [],
    "Outros Projetos": [],
  };

  for (const repo of repositories) {
    const category = identifyCategory(repo.topics);
    grouped[category].push(repo);
  }

  return grouped;
}
