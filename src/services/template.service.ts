import type { Repository } from "../types/repository.type.js";
import type { CategorizedRepositories } from "../types/category.type.js";
import { identifyCategory } from "../utils/categorizer.js";

function sanitizeMarkdownText(text: string | null): string {
  if (!text) {
    return "Sem descrição informada.";
  }
  return text
    .replace(/[\r\n\t]+/g, " ")
    .replace(/\|/g, "-")
    .trim();
}

/**
 * Generates the public profile README.md markdown content.
 * Includes ONLY public repositories, presented in tables per category.
 */
export function generateProfileReadme(
  categorizedRepos: CategorizedRepositories,
  username: string
): string {
  const lines: string[] = [];

  lines.push("Bem-vindo ao meu perfil do GitHub!");
  lines.push("");
  lines.push(
    `Este catálogo de projetos públicos é classificado e atualizado automaticamente pelo robô [**github-profile-catalog-bot**](https://github.com/${username}/github-profile-catalog-bot), consumindo a API oficial do GitHub e organizando os projetos por área em ordem cronológica reversa (do mais recente para o mais antigo).`
  );
  lines.push("");

  let totalPublicRepos = 0;

  for (const [category, repos] of Object.entries(categorizedRepos)) {
    // Filter strictly public repositories
    const publicRepos = repos.filter((r) => !r.isPrivate);

    if (publicRepos.length === 0) {
      continue;
    }

    totalPublicRepos += publicRepos.length;

    lines.push(`### ${category}`);
    lines.push("| Repositório | Descrição |");
    lines.push("| :--- | :--- |");

    for (const repo of publicRepos) {
      const desc = sanitizeMarkdownText(repo.description);
      lines.push(`| [**${repo.name}**](${repo.htmlUrl}) | ${desc} |`);
    }

    lines.push("");
  }

  if (totalPublicRepos === 0) {
    lines.push("_Nenhum repositório público encontrado no momento._");
    lines.push("");
  }

  return lines.join("\n");
}

/**
 * Generates the private complete inventory markdown content.
 * Includes ALL repositories (public, private, forks, archived) with detailed status badges.
 */
export function generateInventoryMarkdown(
  repositories: Repository[],
  username: string
): string {
  const lines: string[] = [];
  const now = new Date().toLocaleString("pt-BR", { timeZone: "America/Sao_Paulo" });

  lines.push(`# Inventário Completo de Repositórios (@${username})`);
  lines.push("");
  lines.push(`> **Total de Repositórios:** ${repositories.length}  `);
  lines.push(`> **Última Atualização:** ${now}`);
  lines.push("");
  lines.push("| Status | Repositório | Categoria | Criação | Fork | Arquivado | Tópicos |");
  lines.push("| :---: | :--- | :--- | :---: | :---: | :---: | :--- |");

  for (const repo of repositories) {
    const status = repo.isPrivate ? "`[Private]`" : "`[Public]`";
    const category = identifyCategory(repo.topics);
    const date = repo.createdAt.substring(0, 10);
    const isFork = repo.isFork ? "Sim" : "Não";
    const isArchived = repo.isArchived ? "Sim" : "Não";
    const topics = repo.topics.length > 0 ? repo.topics.map((t) => `\`${sanitizeMarkdownText(t)}\``).join(", ") : "-";
    const repoLink = `[**${repo.name}**](${repo.htmlUrl})`;

    lines.push(
      `| ${status} | ${repoLink} | ${category} | ${date} | ${isFork} | ${isArchived} | ${topics} |`
    );
  }

  lines.push("");

  return lines.join("\n");
}
