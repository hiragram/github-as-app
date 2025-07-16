import { Octokit } from '@octokit/rest';
import { parseRepository } from '../github-client.js';
import { CallToolResult } from '@modelcontextprotocol/sdk/types.js';

export const pullRequestTools = [
  {
    name: 'list_prs',
    description: 'List pull requests in a repository',
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
          description: 'State of PRs to list',
        },
        base: {
          type: 'string',
          description: 'Filter by base branch',
        },
        head: {
          type: 'string',
          description: 'Filter by head branch',
        },
      },
      required: ['repository'],
    },
  },
  {
    name: 'get_pr',
    description: 'Get details of a specific pull request',
    inputSchema: {
      type: 'object',
      properties: {
        repository: {
          type: 'string',
          description: 'Repository in format owner/repo',
        },
        pr_number: {
          type: 'number',
          description: 'Pull request number',
        },
      },
      required: ['repository', 'pr_number'],
    },
  },
  {
    name: 'create_pr',
    description: 'Create a new pull request',
    inputSchema: {
      type: 'object',
      properties: {
        repository: {
          type: 'string',
          description: 'Repository in format owner/repo',
        },
        title: {
          type: 'string',
          description: 'PR title',
        },
        head: {
          type: 'string',
          description: 'The name of the branch where your changes are implemented',
        },
        base: {
          type: 'string',
          description: 'The name of the branch you want the changes pulled into',
        },
        body: {
          type: 'string',
          description: 'PR body',
        },
        draft: {
          type: 'boolean',
          default: false,
          description: 'Create as draft PR',
        },
      },
      required: ['repository', 'title', 'head', 'base'],
    },
  },
  {
    name: 'update_pr',
    description: 'Update an existing pull request',
    inputSchema: {
      type: 'object',
      properties: {
        repository: {
          type: 'string',
          description: 'Repository in format owner/repo',
        },
        pr_number: {
          type: 'number',
          description: 'Pull request number',
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
          description: 'PR state',
        },
      },
      required: ['repository', 'pr_number'],
    },
  },
  {
    name: 'comment_pr',
    description: 'Add a comment to a pull request',
    inputSchema: {
      type: 'object',
      properties: {
        repository: {
          type: 'string',
          description: 'Repository in format owner/repo',
        },
        pr_number: {
          type: 'number',
          description: 'Pull request number',
        },
        body: {
          type: 'string',
          description: 'Comment body',
        },
      },
      required: ['repository', 'pr_number', 'body'],
    },
  },
  {
    name: 'merge_pr',
    description: 'Merge a pull request',
    inputSchema: {
      type: 'object',
      properties: {
        repository: {
          type: 'string',
          description: 'Repository in format owner/repo',
        },
        pr_number: {
          type: 'number',
          description: 'Pull request number',
        },
        merge_method: {
          type: 'string',
          enum: ['merge', 'squash', 'rebase'],
          default: 'merge',
          description: 'Merge method',
        },
      },
      required: ['repository', 'pr_number'],
    },
  },
  {
    name: 'assign_pr',
    description: 'Assign users to a pull request',
    inputSchema: {
      type: 'object',
      properties: {
        repository: {
          type: 'string',
          description: 'Repository in format owner/repo',
        },
        pr_number: {
          type: 'number',
          description: 'Pull request number',
        },
        assignees: {
          type: 'array',
          items: { type: 'string' },
          description: 'Usernames to assign',
        },
      },
      required: ['repository', 'pr_number', 'assignees'],
    },
  },
  {
    name: 'request_reviewers',
    description: 'Request reviewers for a pull request',
    inputSchema: {
      type: 'object',
      properties: {
        repository: {
          type: 'string',
          description: 'Repository in format owner/repo',
        },
        pr_number: {
          type: 'number',
          description: 'Pull request number',
        },
        reviewers: {
          type: 'array',
          items: { type: 'string' },
          description: 'Usernames of reviewers',
        },
        team_reviewers: {
          type: 'array',
          items: { type: 'string' },
          description: 'Team slugs for team reviewers',
        },
      },
      required: ['repository', 'pr_number'],
    },
  },
  {
    name: 'create_review_comment',
    description: 'Create a review comment on a specific line in a pull request',
    inputSchema: {
      type: 'object',
      properties: {
        repository: {
          type: 'string',
          description: 'Repository in format owner/repo',
        },
        pr_number: {
          type: 'number',
          description: 'Pull request number',
        },
        body: {
          type: 'string',
          description: 'Comment body',
        },
        path: {
          type: 'string',
          description: 'The relative path to the file that necessitates a comment',
        },
        line: {
          type: 'number',
          description: 'The line of the blob in the pull request diff that the comment applies to',
        },
        side: {
          type: 'string',
          enum: ['LEFT', 'RIGHT'],
          default: 'RIGHT',
          description: 'Side of the diff to comment on',
        },
      },
      required: ['repository', 'pr_number', 'body', 'path', 'line'],
    },
  },
  {
    name: 'submit_review',
    description: 'Submit a review for a pull request',
    inputSchema: {
      type: 'object',
      properties: {
        repository: {
          type: 'string',
          description: 'Repository in format owner/repo',
        },
        pr_number: {
          type: 'number',
          description: 'Pull request number',
        },
        body: {
          type: 'string',
          description: 'Review body',
        },
        event: {
          type: 'string',
          enum: ['APPROVE', 'REQUEST_CHANGES', 'COMMENT'],
          description: 'The review action',
        },
      },
      required: ['repository', 'pr_number', 'event'],
    },
  },
  {
    name: 'get_pr_checks',
    description: 'Get check runs for a pull request',
    inputSchema: {
      type: 'object',
      properties: {
        repository: {
          type: 'string',
          description: 'Repository in format owner/repo',
        },
        pr_number: {
          type: 'number',
          description: 'Pull request number',
        },
      },
      required: ['repository', 'pr_number'],
    },
  },
  {
    name: 'get_pr_status',
    description: 'Get combined status for a pull request',
    inputSchema: {
      type: 'object',
      properties: {
        repository: {
          type: 'string',
          description: 'Repository in format owner/repo',
        },
        pr_number: {
          type: 'number',
          description: 'Pull request number',
        },
      },
      required: ['repository', 'pr_number'],
    },
  },
  {
    name: 'update_pr_comment',
    description: 'Update an existing comment on a pull request',
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

export async function handlePullRequestTool(
  client: Octokit,
  toolName: string,
  args: any
): Promise<CallToolResult> {
  const { owner, repo } = parseRepository(args.repository);

  switch (toolName) {
    case 'list_prs': {
      const response = await client.pulls.list({
        owner,
        repo,
        state: args.state || 'open',
        base: args.base,
        head: args.head,
      });

      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(
              response.data.map((pr) => ({
                number: pr.number,
                title: pr.title,
                state: pr.state,
                draft: pr.draft,
                head: pr.head.ref,
                base: pr.base.ref,
                created_at: pr.created_at,
                updated_at: pr.updated_at,
                url: pr.html_url,
              })),
              null,
              2
            ),
          },
        ],
      };
    }

    case 'get_pr': {
      const response = await client.pulls.get({
        owner,
        repo,
        pull_number: args.pr_number,
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
                draft: response.data.draft,
                head: response.data.head.ref,
                base: response.data.base.ref,
                mergeable: response.data.mergeable,
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

    case 'create_pr': {
      const response = await client.pulls.create({
        owner,
        repo,
        title: args.title,
        head: args.head,
        base: args.base,
        body: args.body,
        draft: args.draft,
      });

      return {
        content: [
          {
            type: 'text',
            text: `Pull request created: #${response.data.number} - ${response.data.title}\nURL: ${response.data.html_url}`,
          },
        ],
      };
    }

    case 'update_pr': {
      const response = await client.pulls.update({
        owner,
        repo,
        pull_number: args.pr_number,
        title: args.title,
        body: args.body,
        state: args.state,
      });

      return {
        content: [
          {
            type: 'text',
            text: `Pull request updated: #${response.data.number} - ${response.data.title}`,
          },
        ],
      };
    }

    case 'comment_pr': {
      const response = await client.issues.createComment({
        owner,
        repo,
        issue_number: args.pr_number,
        body: args.body,
      });

      return {
        content: [
          {
            type: 'text',
            text: `Comment added to PR #${args.pr_number}\nURL: ${response.data.html_url}`,
          },
        ],
      };
    }

    case 'merge_pr': {
      const response = await client.pulls.merge({
        owner,
        repo,
        pull_number: args.pr_number,
        merge_method: args.merge_method || 'merge',
      });

      return {
        content: [
          {
            type: 'text',
            text: `Pull request #${args.pr_number} merged successfully`,
          },
        ],
      };
    }

    case 'assign_pr': {
      const response = await client.issues.addAssignees({
        owner,
        repo,
        issue_number: args.pr_number,
        assignees: args.assignees,
      });

      return {
        content: [
          {
            type: 'text',
            text: `Assigned ${args.assignees.join(', ')} to PR #${args.pr_number}`,
          },
        ],
      };
    }

    case 'request_reviewers': {
      const response = await client.pulls.requestReviewers({
        owner,
        repo,
        pull_number: args.pr_number,
        reviewers: args.reviewers,
        team_reviewers: args.team_reviewers,
      });

      return {
        content: [
          {
            type: 'text',
            text: `Requested reviews for PR #${args.pr_number}`,
          },
        ],
      };
    }

    case 'create_review_comment': {
      // Get the PR to find the latest commit SHA
      const pr = await client.pulls.get({
        owner,
        repo,
        pull_number: args.pr_number,
      });
      
      const response = await client.pulls.createReviewComment({
        owner,
        repo,
        pull_number: args.pr_number,
        body: args.body,
        path: args.path,
        commit_id: pr.data.head.sha,
        line: args.line,
        side: args.side || 'RIGHT',
      });

      return {
        content: [
          {
            type: 'text',
            text: `Review comment added to PR #${args.pr_number} on ${args.path}:${args.line}`,
          },
        ],
      };
    }

    case 'submit_review': {
      const response = await client.pulls.createReview({
        owner,
        repo,
        pull_number: args.pr_number,
        body: args.body,
        event: args.event,
      });

      return {
        content: [
          {
            type: 'text',
            text: `Review submitted for PR #${args.pr_number}: ${args.event}`,
          },
        ],
      };
    }

    case 'get_pr_checks': {
      const pr = await client.pulls.get({
        owner,
        repo,
        pull_number: args.pr_number,
      });

      const response = await client.checks.listForRef({
        owner,
        repo,
        ref: pr.data.head.sha,
      });

      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(
              {
                total_count: response.data.total_count,
                check_runs: response.data.check_runs.map((check) => ({
                  name: check.name,
                  status: check.status,
                  conclusion: check.conclusion,
                  started_at: check.started_at,
                  completed_at: check.completed_at,
                  output: check.output?.summary,
                })),
              },
              null,
              2
            ),
          },
        ],
      };
    }

    case 'get_pr_status': {
      const pr = await client.pulls.get({
        owner,
        repo,
        pull_number: args.pr_number,
      });

      const response = await client.repos.getCombinedStatusForRef({
        owner,
        repo,
        ref: pr.data.head.sha,
      });

      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(
              {
                state: response.data.state,
                total_count: response.data.total_count,
                statuses: response.data.statuses.map((status) => ({
                  context: status.context,
                  state: status.state,
                  description: status.description,
                  target_url: status.target_url,
                })),
              },
              null,
              2
            ),
          },
        ],
      };
    }

    case 'update_pr_comment': {
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
      throw new Error(`Unknown pull request tool: ${toolName}`);
  }
}