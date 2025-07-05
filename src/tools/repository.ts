import { Octokit } from '@octokit/rest';
import { parseRepository } from '../github-client.js';
import { CallToolResult } from '@modelcontextprotocol/sdk/types.js';

export const repositoryTools = [
  {
    name: 'create_commit',
    description: 'Create a commit with file changes as GitHub App',
    inputSchema: {
      type: 'object',
      properties: {
        repository: {
          type: 'string',
          description: 'Repository in format owner/repo',
        },
        branch: {
          type: 'string',
          description: 'Branch name to commit to',
        },
        message: {
          type: 'string',
          description: 'Commit message',
        },
        files: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              path: {
                type: 'string',
                description: 'File path relative to repository root',
              },
              content: {
                type: 'string',
                description: 'File content (will be base64 encoded)',
              },
              mode: {
                type: 'string',
                enum: ['100644', '100755', '040000', '160000', '120000'],
                default: '100644',
                description: 'File mode',
              },
            },
            required: ['path', 'content'],
          },
          description: 'Files to include in the commit',
        },
        author: {
          type: 'object',
          properties: {
            name: {
              type: 'string',
              description: 'Author name (defaults to GitHub App name)',
            },
            email: {
              type: 'string',
              description: 'Author email (defaults to GitHub App email)',
            },
          },
          description: 'Commit author information',
        },
      },
      required: ['repository', 'branch', 'message', 'files'],
    },
  },
];

export async function handleRepositoryTool(
  client: Octokit,
  toolName: string,
  args: any
): Promise<CallToolResult> {
  const { owner, repo } = parseRepository(args.repository);

  switch (toolName) {
    case 'create_commit': {
      // Get the current commit SHA for the branch
      const { data: refData } = await client.git.getRef({
        owner,
        repo,
        ref: `heads/${args.branch}`,
      });
      const currentCommitSha = refData.object.sha;

      // Get the tree SHA from the current commit
      const { data: commitData } = await client.git.getCommit({
        owner,
        repo,
        commit_sha: currentCommitSha,
      });
      const currentTreeSha = commitData.tree.sha;

      // Create blobs for each file
      const blobs = await Promise.all(
        args.files.map(async (file: any) => {
          const { data: blobData } = await client.git.createBlob({
            owner,
            repo,
            content: Buffer.from(file.content).toString('base64'),
            encoding: 'base64',
          });
          return {
            path: file.path,
            mode: file.mode || '100644',
            type: 'blob' as const,
            sha: blobData.sha,
          };
        })
      );

      // Create a new tree
      const { data: treeData } = await client.git.createTree({
        owner,
        repo,
        tree: blobs,
        base_tree: currentTreeSha,
      });

      // Prepare author information
      const authorName = args.author?.name || process.env.GITHUB_APP_NAME || 'GitHub App';
      const authorEmail = args.author?.email || process.env.GITHUB_APP_EMAIL || 'github-app[bot]@users.noreply.github.com';

      // Create a new commit
      const { data: newCommitData } = await client.git.createCommit({
        owner,
        repo,
        message: args.message,
        tree: treeData.sha,
        parents: [currentCommitSha],
        author: {
          name: authorName,
          email: authorEmail,
        },
      });

      // Update the branch reference
      await client.git.updateRef({
        owner,
        repo,
        ref: `heads/${args.branch}`,
        sha: newCommitData.sha,
      });

      return {
        content: [
          {
            type: 'text',
            text: `Commit created successfully: ${newCommitData.sha}\nAuthor: ${authorName} <${authorEmail}>\nMessage: ${args.message}\nFiles changed: ${args.files.length}`,
          },
        ],
      };
    }

    default:
      throw new Error(`Unknown repository tool: ${toolName}`);
  }
}