import { Octokit } from '@octokit/rest';
import { parseRepository } from '../github-client.js';
import { CallToolResult } from '@modelcontextprotocol/sdk/types.js';

export const issueTools = [
  {
    name: 'list_issues',
    description: 'List issues in a repository',
    inputSchema: {
      type: 'object',
      properties: {
        repository: {
          type: 'string',
          description: 'Repository in format owner/repo',
        },
        state: {
          type: 'string',
          enum: ['open', 'closed', 'all'],
          default: 'open',
          description: 'State of issues to list',
        },
        labels: {
          type: 'string',
          description: 'Comma-separated list of labels',
        },
        assignee: {
          type: 'string',
          description: 'Username of assignee',
        },
      },
      required: ['repository'],
    },
  },
  {
    name: 'get_issue',
    description: 'Get details of a specific issue',
    inputSchema: {
      type: 'object',
      properties: {
        repository: {
          type: 'string',
          description: 'Repository in format owner/repo',
        },
        issue_number: {
          type: 'number',
          description: 'Issue number',
        },
      },
      required: ['repository', 'issue_number'],
    },
  },
  {
    name: 'create_issue',
    description: 'Create a new issue',
    inputSchema: {
      type: 'object',
      properties: {
        repository: {
          type: 'string',
          description: 'Repository in format owner/repo',
        },
        title: {
          type: 'string',
          description: 'Issue title',
        },
        body: {
          type: 'string',
          description: 'Issue body',
        },
        labels: {
          type: 'array',
          items: { type: 'string' },
          description: 'Labels to add to the issue',
        },
        assignees: {
          type: 'array',
          items: { type: 'string' },
          description: 'Usernames to assign',
        },
      },
      required: ['repository', 'title'],
    },
  },
  {
    name: 'update_issue',
    description: 'Update an existing issue',
    inputSchema: {
      type: 'object',
      properties: {
        repository: {
          type: 'string',
          description: 'Repository in format owner/repo',
        },
        issue_number: {
          type: 'number',
          description: 'Issue number',
        },
        title: {
          type: 'string',
          description: 'New title',
        },
        body: {
          type: 'string',
          description: 'New body',
        },
        state: {
          type: 'string',
          enum: ['open', 'closed'],
          description: 'Issue state',
        },
        labels: {
          type: 'array',
          items: { type: 'string' },
          description: 'Labels to set (replaces existing)',
        },
      },
      required: ['repository', 'issue_number'],
    },
  },
  {
    name: 'comment_issue',
    description: 'Add a comment to an issue',
    inputSchema: {
      type: 'object',
      properties: {
        repository: {
          type: 'string',
          description: 'Repository in format owner/repo',
        },
        issue_number: {
          type: 'number',
          description: 'Issue number',
        },
        body: {
          type: 'string',
          description: 'Comment body',
        },
      },
      required: ['repository', 'issue_number', 'body'],
    },
  },
  {
    name: 'assign_issue',
    description: 'Assign users to an issue',
    inputSchema: {
      type: 'object',
      properties: {
        repository: {
          type: 'string',
          description: 'Repository in format owner/repo',
        },
        issue_number: {
          type: 'number',
          description: 'Issue number',
        },
        assignees: {
          type: 'array',
          items: { type: 'string' },
          description: 'Usernames to assign',
        },
      },
      required: ['repository', 'issue_number', 'assignees'],
    },
  },
  {
    name: 'update_issue_comment',
    description: 'Update an existing comment on an issue',
    inputSchema: {
      type: 'object',
      properties: {
        repository: {
          type: 'string',
          description: 'Repository in format owner/repo',
        },
        comment_id: {
          type: 'number',
          description: 'Comment ID',
        },
        body: {
          type: 'string',
          description: 'New comment body',
        },
      },
      required: ['repository', 'comment_id', 'body'],
    },
  },
];

export async function handleIssueTool(
  client: Octokit,
  toolName: string,
  args: any
): Promise<CallToolResult> {
  const { owner, repo } = parseRepository(args.repository);

  switch (toolName) {
    case 'list_issues': {
      const response = await client.issues.listForRepo({
        owner,
        repo,
        state: args.state || 'open',
        labels: args.labels,
        assignee: args.assignee,
      });

      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(
              response.data.map((issue) => ({
                number: issue.number,
                title: issue.title,
                state: issue.state,
                labels: issue.labels.map((l) => typeof l === 'string' ? l : l.name),
                assignees: issue.assignees?.map((a) => a.login),
                created_at: issue.created_at,
                updated_at: issue.updated_at,
                url: issue.html_url,
              })),
              null,
              2
            ),
          },
        ],
      };
    }

    case 'get_issue': {
      const response = await client.issues.get({
        owner,
        repo,
        issue_number: args.issue_number,
      });

      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(
              {
                number: response.data.number,
                title: response.data.title,
                body: response.data.body,
                state: response.data.state,
                labels: response.data.labels.map((l: any) => typeof l === 'string' ? l : l.name),
                assignees: response.data.assignees?.map((a) => a.login),
                created_at: response.data.created_at,
                updated_at: response.data.updated_at,
                url: response.data.html_url,
              },
              null,
              2
            ),
          },
        ],
      };
    }

    case 'create_issue': {
      const response = await client.issues.create({
        owner,
        repo,
        title: args.title,
        body: args.body,
        labels: args.labels,
        assignees: args.assignees,
      });

      return {
        content: [
          {
            type: 'text',
            text: `Issue created: #${response.data.number} - ${response.data.title}\nURL: ${response.data.html_url}`,
          },
        ],
      };
    }

    case 'update_issue': {
      const response = await client.issues.update({
        owner,
        repo,
        issue_number: args.issue_number,
        title: args.title,
        body: args.body,
        state: args.state,
        labels: args.labels,
      });

      return {
        content: [
          {
            type: 'text',
            text: `Issue updated: #${response.data.number} - ${response.data.title}`,
          },
        ],
      };
    }

    case 'comment_issue': {
      const response = await client.issues.createComment({
        owner,
        repo,
        issue_number: args.issue_number,
        body: args.body,
      });

      return {
        content: [
          {
            type: 'text',
            text: `Comment added to issue #${args.issue_number}\nURL: ${response.data.html_url}`,
          },
        ],
      };
    }

    case 'assign_issue': {
      const response = await client.issues.addAssignees({
        owner,
        repo,
        issue_number: args.issue_number,
        assignees: args.assignees,
      });

      return {
        content: [
          {
            type: 'text',
            text: `Assigned ${args.assignees.join(', ')} to issue #${args.issue_number}`,
          },
        ],
      };
    }

    case 'update_issue_comment': {
      const response = await client.issues.updateComment({
        owner,
        repo,
        comment_id: args.comment_id,
        body: args.body,
      });

      return {
        content: [
          {
            type: 'text',
            text: `Updated comment ${args.comment_id}\nURL: ${response.data.html_url}`,
          },
        ],
      };
    }

    default:
      throw new Error(`Unknown issue tool: ${toolName}`);
  }
}