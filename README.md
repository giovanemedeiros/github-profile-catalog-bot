# GitHub Profile Catalog Bot

Robô de automação desenvolvido em TypeScript e Node.js para consumir a API oficial do GitHub, classificar repositórios por áreas técnicas e sincronizar dinamicamente vitrines e inventários em formato Markdown no perfil do GitHub.

## Visao Geral

O robô automatiza o gerenciamento de portfólio, governança de código e documentação técnica através da API REST oficial do GitHub (via Octokit):
- Coleta paginada de todos os repositórios da conta (públicos, privados, forks e arquivados).
- Ordenação em ordem cronológica reversa por data de criação (do mais recente ao mais antigo).
- Categorização estrita por tópicos prioritários (`qa`, `rpa`, `front-end`, `back-end`, `full-stack`, com fallback para `Outros Projetos`).
- Sanitização de texto para garantir formatação limpa nas tabelas Markdown sem quebras indesejadas.

## Provisionamento Automatico e Sincronizacao de Destinos

O bot possui um mecanismo resiliente de auto-provisionamento (`ensureRepositoryExists` e `syncFileContent`). Caso os repositórios de destino não existam ou tenham sido excluídos, a automação detecta o status `404 Not Found`, cria os repositórios com suas configurações apropriadas e realiza o commit dos arquivos:

1. **Vitrine do Perfil Público (`<usuario>/<usuario>`):**
   - **Visibilidade:** Pública.
   - **Descrição do Repositório:** Configurada automaticamente com texto descritivo corporativo.
   - **Conteúdo Gerado:** Atualiza o `README.md` principal da conta exibindo **exclusivamente projetos públicos**, agrupados por categorias técnicas em tabelas limpas de duas colunas (Repositório e Descrição), com links clicáveis e sem linhas divisórias indesejadas.

2. **Inventário Completo Privado (`<usuario>/github-profile-inventory`):**
   - **Visibilidade:** Privada (garantindo a segurança de projetos não públicos).
   - **Descrição do Repositório:** Configurada automaticamente via API.
   - **Conteúdo Gerado:** Atualiza o `README.md` do inventário contendo uma auditoria completa de **100% dos repositórios** da conta (públicos, privados, forks e arquivados). Todos os repositórios possuem links clicáveis padronizados, descrições tratadas e badges indicativas de status em cada linha:
     - `[Public]` / `[Private]`
     - `[Fork]`
     - `[Archived]`

## Gestao Agil e Governanca com Jira Software

O ciclo de vida do projeto foi conduzido com boas práticas corporativas de engenharia de software e rastreabilidade ágil no **Jira Software** (Chave do Projeto: `GPCB`):

- **Estrutura de Backlog:** Decomposição em 3 Épicos (`GPCB-1` a `GPCB-3`) e 8 User Stories técnicas (`GPCB-4` a `GPCB-11`).
- **Rastreabilidade Git:** Padrão *Conventional Commits* vinculado às chaves de issues do Jira (ex: `GPCB-10: feat: implement remote synchronization via Octokit API`).
- **Fluxo de Branches e PRs:** Desenvolvimento modular via feature branches (`feature/GPCB-X-...`) com validações antes da integração na branch principal `main`.

## Automacao e Esteira CI/CD (GitHub Actions)

O projeto possui uma esteira automatizada configurada em `.github/workflows/catalog-sync.yml` que executa diretamente na nuvem:

1. **Configuracao do Secret no Repositorio:**
   - Acesse **Settings > Secrets and variables > Actions > New repository secret**.
   - Defina o nome como `PERSONAL_ACCESS_TOKEN` e insira o seu token pessoal com escopo `repo`.
2. **Periodicidade e Gatilhos de Execucao:**
   - **Agendamento Automatico (Diario):** Executa automaticamente uma vez a cada 24 horas (todos os dias a meia-noite UTC / 21h no horario de Brasilia - expressao cron `0 0 * * *`), mantendo os perfis e inventarios sempre sincronizados.
   - **Disparo Manual Sob Demanda (Workflow Dispatch):** Pode ser executada a qualquer instante atraves da aba **Actions** > selecionando **GitHub Profile & Inventory Catalog Sync** > clicando em **Run workflow**.

## Arquitetura do Projeto

```text
github-profile-catalog-bot/
├── .github/
│   └── workflows/
│       └── catalog-sync.yml      # Pipeline CI/CD de sincronizacao continua
├── src/
│   ├── config/
│   │   └── octokit.ts             # Instancia autenticada do cliente Octokit
│   ├── services/
│   │   ├── github.service.ts      # Servico de busca paginada de repositorios
│   │   ├── template.service.ts    # Formatadores Markdown (Perfil e Inventario)
│   │   └── sync.service.ts        # Motor de auto-provisionamento e commits via API
│   ├── types/
│   │   ├── category.type.ts       # Mapeamento e definicoes de categorias tecnicas
│   │   └── repository.type.ts     # Interface de dados do repositorio
│   ├── utils/
│   │   ├── categorizer.ts         # Logica estrita de identificacao de categorias
│   │   └── sorter.ts              # Algoritmo de ordenacao cronologica decrescente
│   └── index.ts                   # Orquestrador do fluxo da aplicacao
├── .env.example                   # Exemplo de variaveis de ambiente locais
├── LICENSE                        # Licenca GNU GPL v3.0
├── package.json
└── tsconfig.json
```

## Variaveis de Ambiente

| Variavel | Obrigatoria | Descricao | Valor Padrao |
| :--- | :--- | :--- | :--- |
| `GITHUB_TOKEN` | Sim | Personal Access Token (classic) com permissao `repo` | - |
| `GITHUB_USERNAME` | Nao | Nome de usuario do GitHub | `giovanemedeiros` |
| `INVENTORY_REPO_NAME` | Nao | Nome do repositorio privado de inventario | `github-profile-inventory` |

## Como Reutilizar e Executar Localmente

### 1. Clonar o Repositorio
```bash
git clone https://github.com/giovanemedeiros/github-profile-catalog-bot.git
cd github-profile-catalog-bot
```

### 2. Instalar Dependencias
```bash
npm install
```

### 3. Configurar o Arquivo `.env`
Crie o arquivo `.env` na raiz do projeto com base no `.env.example`:
```env
GITHUB_TOKEN=seu_personal_access_token_aqui
GITHUB_USERNAME=seu_usuario_github
INVENTORY_REPO_NAME=github-profile-inventory
```

### 4. Executar em Modo de Desenvolvimento
```bash
npm run dev
```

## Licenca

Este projeto esta sob a licenca **GNU General Public License v3.0 (GPL-3.0)**. Consulte o arquivo [LICENSE](LICENSE) para mais informacoes.
