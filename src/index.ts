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
import { handleGetIdentity } from './tools/identity.js';
import fs from 'fs';
import path from 'path';

dotenv.config();

// Logging setup
const logFile = '/tmp/github-as-app.log';
const log = (message: string, data?: any) => {
  const timestamp = new Date().toISOString();
  const logMessage = `[${timestamp}] ${message}${data ? ' ' + JSON.stringify(data) : ''}\n`;
  fs.appendFileSync(logFile, logMessage);
  console.error(logMessage.trim());
};

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

const identityTool = {
  name: 'get_identity',
  description: 'Get authenticated GitHub App identity information',
  inputSchema: {
    type: 'object',
    properties: {},
  },
};

const allTools = [
  ...issueTools,
  ...pullRequestTools,
  ...repositoryTools,
  identityTool,
];

server.setRequestHandler(ListToolsRequestSchema, async () => ({
  tools: allTools,
}));

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;
  
  log(`Tool called: ${name}`, { args });

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
    else if (name === 'git_commit') {
      return await handleRepositoryTool(client, name, args);
    }
    // Identity tool
    else if (name === 'get_identity') {
      const identity = await handleGetIdentity();
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(identity, null, 2),
          },
        ],
      };
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
  log('Starting GitHub App MCP server');
  
  // Check for required environment variables
  // Support both BOT_GITHUB_ and GITHUB_ prefixes (BOT_GITHUB_ takes precedence)
  const requiredEnvVars = [
    { key: 'APP_ID', botKey: 'BOT_GITHUB_APP_ID', fallbackKey: 'GITHUB_APP_ID' },
    { key: 'APP_PRIVATE_KEY', botKey: 'BOT_GITHUB_APP_PRIVATE_KEY', fallbackKey: 'GITHUB_APP_PRIVATE_KEY' },
    { key: 'APP_INSTALLATION_ID', botKey: 'BOT_GITHUB_APP_INSTALLATION_ID', fallbackKey: 'GITHUB_APP_INSTALLATION_ID' },
  ];

  const envStatus: any = {};
  for (const { key, botKey, fallbackKey } of requiredEnvVars) {
    const value = process.env[botKey] || process.env[fallbackKey];
    envStatus[key] = value ? 'SET' : 'NOT SET';
    if (!value) {
      log(`Error: Missing required environment variable: ${botKey} or ${fallbackKey}`);
      console.error(`Error: Missing required environment variable: ${botKey} or ${fallbackKey}`);
      process.exit(1);
    }
  }
  
  log('Environment variables status', envStatus);

  const transport = new StdioServerTransport();
  await server.connect(transport);

  log('GitHub App MCP server started successfully');
  console.error('GitHub App MCP server started');
}

main().catch((error) => {
  console.error('Server error:', error);
  process.exit(1);
});