import { Octokit } from '@octokit/rest';
import { CallToolResult } from '@modelcontextprotocol/sdk/types.js';
import { execSync } from 'child_process';
import fs from 'fs';

export const repositoryTools = [
  {
    name: 'git_commit',
    description: 'Create a git commit with GitHub App as author. Requires changes to be staged first.',
    inputSchema: {
      type: 'object',
      properties: {
        message: {
          type: 'string',
          description: 'Commit message',
        },
        workingDirectory: {
          type: 'string',
          description: 'Working directory path (defaults to current directory)',
        },
      },
      required: ['message'],
    },
  },
];

export async function handleRepositoryTool(
  client: Octokit,
  toolName: string,
  args: any
): Promise<CallToolResult> {
  switch (toolName) {
    case 'git_commit': {
      const workingDir = args.workingDirectory || process.cwd();
      
      // Get GitHub App information
      const appName = process.env.GITHUB_APP_NAME || 'GitHub App';
      const appEmail = process.env.GITHUB_APP_EMAIL || 'github-app[bot]@users.noreply.github.com';
      
      // Check if there are staged changes
      try {
        const status = execSync('git diff --cached --exit-code', { 
          cwd: workingDir,
          encoding: 'utf8'
        });
      } catch (e) {
        // git diff --cached --exit-code returns non-zero if there are staged changes
        // This is expected, so we continue
      }
      
      try {
        // Create the commit with GitHub App as author (committer remains as the current user)
        const commitOutput = execSync(`git commit --author="${appName} <${appEmail}>" -m "${args.message.replace(/"/g, '\\"')}"`, {
          cwd: workingDir,
          encoding: 'utf8'
        });
        
        // Get the commit SHA
        const commitSha = execSync('git rev-parse HEAD', { 
          cwd: workingDir, 
          encoding: 'utf8' 
        }).trim();
        
        return {
          content: [
            {
              type: 'text',
              text: `Commit created successfully: ${commitSha}\nAuthor: ${appName} <${appEmail}>\n${commitOutput}`,
            },
          ],
        };
      } catch (error) {
        throw new Error(`Failed to create commit: ${error}`);
      }
    }

    default:
      throw new Error(`Unknown repository tool: ${toolName}`);
  }
}