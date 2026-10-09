import type { Repository } from "./repository.type.js";

export type Category =
  | "QA & Automação de Testes"
  | "RPA & Automação de Processos"
  | "Desenvolvimento Front-End"
  | "Desenvolvimento Back-End"
  | "Desenvolvimento Full-Stack"
  | "Outros Projetos";

export type CategorizedRepositories = Record<Category, Repository[]>;
