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
 * Creates or updates a file in a remote GitHub repository via API.
 */
export async function syncFileContent(options: SyncFileOptions): Promise<void> {

  let sha = undefined; 

  try {
    const response = await octokit.rest.repos.getContent({
      owner: options.owner,
      repo: options.repo,
      path: options.path
    })

    if (Array.isArray(response.data)) {
      throw new Error(`[ERROR] Expected file at ${options.path}, but found a directory.`);
    }

    if ("sha" in response.data) {
      sha = response.data.sha;
    }
  } catch (error: any) {
    if (error.status !== 404) {
      throw error;
    }
  }

  // Convert the markdown content to Base64
  const contentBase64 = Buffer.from(options.content, "utf-8").toString("base64");

  // Commit the file using octokit.rest.repos.createOrUpdateFileContents
  await octokit.rest.repos.createOrUpdateFileContents({
    owner: options.owner,
    repo: options.repo,
    path: options.path,
    message: options.commitMessage,
    content: contentBase64,
    ...(sha ? { sha } : {}),
  });

  console.log(`[SUCCESS] File ${options.path} synced to ${options.owner}/${options.repo}.`);
}
