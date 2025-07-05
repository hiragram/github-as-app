#!/usr/bin/env node
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ErrorCode,
  ListToolsRequestSchema,
  McpError,
} from '@modelcontextprotocol/sdk/types.js';
import dotenv from 'dotenv';
import { getGitHubClient } from './github-client.js';
import { issueTools, handleIssueTool } from './tools/issues.js';
import { pullRequestTools, handlePullRequestTool } from './tools/pull-requests.js';
import { repositoryTools, handleRepositoryTool } from './tools/repository.js';

dotenv.config();

const server = new Server(
  {
    name: 'github-as-app',
    version: '0.1.0',
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

const allTools = [
  ...issueTools,
  ...pullRequestTools,
  ...repositoryTools,
];

server.setRequestHandler(ListToolsRequestSchema, async () => ({
  tools: allTools,
}));

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  try {
    const client = await getGitHubClient();

    // Issue-related tools
    if (name.includes('issue')) {
      return await handleIssueTool(client, name, args);
    } 
    // PR-related tools
    else if (name.includes('pr') || name.includes('review')) {
      return await handlePullRequestTool(client, name, args);
    } 
    // Repository-related tools
    else if (name === 'create_commit') {
      return await handleRepositoryTool(client, name, args);
    } 
    else {
      throw new McpError(
        ErrorCode.MethodNotFound,
        `Unknown tool: ${name}`
      );
    }
  } catch (error) {
    if (error instanceof McpError) {
      throw error;
    }

    const errorMessage = error instanceof Error ? error.message : String(error);
    throw new McpError(
      ErrorCode.InternalError,
      `GitHub API error: ${errorMessage}`
    );
  }
});

async function main() {
  const requiredEnvVars = [
    'GITHUB_APP_ID',
    'GITHUB_APP_PRIVATE_KEY',
    'GITHUB_APP_INSTALLATION_ID',
  ];

  for (const envVar of requiredEnvVars) {
    if (!process.env[envVar]) {
      console.error(`Error: Missing required environment variable: ${envVar}`);
      process.exit(1);
    }
  }

  const transport = new StdioServerTransport();
  await server.connect(transport);

  console.error('GitHub App MCP server started');
}

main().catch((error) => {
  console.error('Server error:', error);
  process.exit(1);
});