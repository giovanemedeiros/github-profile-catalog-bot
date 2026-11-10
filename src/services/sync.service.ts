import { octokit } from "../config/octokit.js";

interface SyncFileOptions {
  owner: string;
  repo: string;
  path: string;
  content: string;
  commitMessage: string;
}

/**
 * Ensures a repository exists under the authenticated user account.
 * If it returns 404 (Not Found), creates the repository automatically.
 */
export async function ensureRepositoryExists(
  owner: string,
  repo: string,
  isPrivate: boolean,
  description?: string
): Promise<void> {
  try {
    const { data } = await octokit.rest.repos.get({ owner, repo });
    if (description && !data.description) {
      await octokit.rest.repos.update({
        owner,
        repo,
        description,
      });
    }
  } catch (error: any) {
    if (error.status === 404) {
      console.log(`[INFO] Provisioning new repository: ${owner}/${repo} (Private: ${isPrivate})...`);
      await octokit.rest.repos.createForAuthenticatedUser({
        name: repo,
        private: isPrivate,
        auto_init: true,
        ...(description ? { description } : {}),
      });
      console.log(`[SUCCESS] Repository ${owner}/${repo} created successfully.`);
    } else {
      throw error;
    }
  }
}


/**
 * Synchronizes a file in a remote GitHub repository using a single-commit (historyless) strategy.
 * Creates a root commit (parents: []) and force-updates the branch reference so that past states
 * (such as repositories that were previously public and became private) leave zero trace in commit history.
 */
export async function syncFileContent(options: SyncFileOptions): Promise<void> {
  let defaultBranch = "main";
  let hasParentHistory = false;

  try {
    const { data: repoData } = await octokit.rest.repos.get({
      owner: options.owner,
      repo: options.repo,
    });
    defaultBranch = repoData.default_branch || "main";

    const { data: branchData } = await octokit.rest.repos.getBranch({
      owner: options.owner,
      repo: options.repo,
      branch: defaultBranch,
    });
    hasParentHistory = (branchData.commit.parents?.length ?? 0) > 0;
  } catch (error: any) {
    if (error.status !== 404) {
      throw error;
    }
  }

  try {
    const response = await octokit.rest.repos.getContent({
      owner: options.owner,
      repo: options.repo,
      path: options.path,
    });

    if (Array.isArray(response.data)) {
      throw new Error(`[ERROR] Expected file at ${options.path}, but found a directory.`);
    }

    // Skip commit if content is identical AND branch already has a clean single-commit history
    if (
      !hasParentHistory &&
      "content" in response.data &&
      typeof response.data.content === "string"
    ) {
      const existingDecoded = Buffer.from(
        response.data.content.replace(/\n/g, ""),
        "base64"
      ).toString("utf-8");

      const stripDynamic = (str: string) =>
        str
          .replace(/> \*\*Última Atualização:\*\* .+/g, "")
          .replace(/\r\n/g, "\n")
          .trim();

      if (stripDynamic(existingDecoded) === stripDynamic(options.content)) {
        console.log(
          `[INFO] Content unchanged for ${options.path} in ${options.owner}/${options.repo}. Skipping commit.`
        );
        return;
      }
    }
  } catch (error: any) {
    if (error.status !== 404) {
      throw error;
    }
  }

  // Create a clean Git tree with the updated file
  const { data: treeData } = await octokit.rest.git.createTree({
    owner: options.owner,
    repo: options.repo,
    tree: [
      {
        path: options.path,
        mode: "100644",
        type: "blob",
        content: options.content,
      },
    ],
  });

  // Create a root (orphan) commit with no parents so previous history is completely purged
  const { data: commitData } = await octokit.rest.git.createCommit({
    owner: options.owner,
    repo: options.repo,
    message: options.commitMessage,
    tree: treeData.sha,
    parents: [],
  });

  // Force-update the default branch pointer to the new single root commit
  await octokit.rest.git.updateRef({
    owner: options.owner,
    repo: options.repo,
    ref: `heads/${defaultBranch}`,
    sha: commitData.sha,
    force: true,
  });

  console.log(
    `[SUCCESS] File ${options.path} synced to ${options.owner}/${options.repo} (single-commit history enforced).`
  );
}
