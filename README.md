# GitHub App MCP Server

An MCP (Model Context Protocol) server that authenticates as a GitHub App to manage Issues, Pull Requests, and repository operations.

## Features

### Issue Operations
- `list_issues` - List issues in a repository
- `get_issue` - Get details of a specific issue
- `create_issue` - Create a new issue
- `update_issue` - Update an existing issue
- `comment_issue` - Add a comment to an issue
- `assign_issue` - Assign users to an issue

### Pull Request Operations
- `list_prs` - List pull requests in a repository
- `get_pr` - Get details of a specific pull request
- `create_pr` - Create a new pull request
- `update_pr` - Update an existing pull request
- `comment_pr` - Add a comment to a pull request
- `merge_pr` - Merge a pull request
- `assign_pr` - Assign users to a pull request
- `request_reviewers` - Request reviewers for a pull request
- `create_review_comment` - Create a review comment on a specific line
- `submit_review` - Submit a review (approve/request changes/comment)
- `get_pr_checks` - Get CI/CD check runs for a pull request
- `get_pr_status` - Get combined status for a pull request

### Repository Operations
- `create_commit` - Create a commit as GitHub App

## Setup

### 1. Create a GitHub App

1. Create a new App on GitHub
2. Configure required permissions:
   - Repository permissions:
     - Contents: Read & Write
     - Issues: Read & Write
     - Pull requests: Read & Write
     - Checks: Read
     - Commit statuses: Read
   - Organization permissions:
     - Members: Read (if using team reviewers)

3. Generate and download a private key

### 2. Configure Environment Variables

Copy `.env.example` to `.env` and set your values:

```bash
cp .env.example .env
```

```env
# GitHub App credentials
GITHUB_APP_ID=your-app-id
GITHUB_APP_PRIVATE_KEY=your-base64-encoded-private-key
GITHUB_APP_INSTALLATION_ID=your-installation-id

# Optional: Custom author information for commits
GITHUB_APP_NAME=Your GitHub App Name
GITHUB_APP_EMAIL=your-app[bot]@users.noreply.github.com
```

#### Encoding the Private Key

To Base64 encode your private key:

```bash
base64 -i path/to/private-key.pem | tr -d '\n'
```

### 3. Install and Run

```bash
# Install dependencies
npm install

# Build TypeScript
npm run build

# Development mode (with hot reload)
npm run dev

# Production mode
npm start
```

## Usage

### Claude Desktop Configuration

#### Option 1: Using npx (Recommended)

Add this to your `claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "github-app": {
      "command": "npx",
      "args": ["github-as-app"],
      "env": {
        "GITHUB_APP_ID": "your-app-id",
        "GITHUB_APP_PRIVATE_KEY": "your-base64-encoded-private-key",
        "GITHUB_APP_INSTALLATION_ID": "your-installation-id"
      }
    }
  }
}
```

#### Option 2: Local Installation

If you've cloned and built the project locally:

```json
{
  "mcpServers": {
    "github-app": {
      "command": "node",
      "args": ["/path/to/github-as-app/dist/index.js"],
      "env": {
        "GITHUB_APP_ID": "your-app-id",
        "GITHUB_APP_PRIVATE_KEY": "your-base64-encoded-private-key",
        "GITHUB_APP_INSTALLATION_ID": "your-installation-id"
      }
    }
  }
}
```

### Usage Examples

#### Create an Issue
```
create_issue({
  repository: "owner/repo",
  title: "Feature request",
  body: "Detailed description...",
  labels: ["enhancement"],
  assignees: ["username"]
})
```

#### Submit a PR Review
```
submit_review({
  repository: "owner/repo",
  pr_number: 123,
  body: "LGTM!",
  event: "APPROVE"
})
```

#### Create a Commit
```
create_commit({
  repository: "owner/repo",
  branch: "main",
  message: "Update configuration",
  files: [
    {
      path: "config.json",
      content: '{"version": "2.0"}'
    }
  ]
})
```

## Development

### Directory Structure
```
github-as-app/
├── src/
│   ├── index.ts          # MCP server entry point
│   ├── github-client.ts  # GitHub App authentication
│   └── tools/           # Tool implementations
│       ├── issues.ts
│       ├── pull-requests.ts
│       └── repository.ts
├── package.json
├── tsconfig.json
├── .env.example
└── README.md
```

## License

MIT