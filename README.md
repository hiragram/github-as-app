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
- `update_issue_comment` - Update an existing comment on an issue

### Pull Request Operations
- `list_prs` - List pull requests in a repository
- `get_pr` - Get details of a specific pull request
- `create_pr` - Create a new pull request
- `update_pr` - Update an existing pull request
- `comment_pr` - Add a comment to a pull request
- `update_pr_comment` - Update an existing comment on a pull request
- `merge_pr` - Merge a pull request
- `assign_pr` - Assign users to a pull request
- `request_reviewers` - Request reviewers for a pull request
- `create_review_comment` - Create a review comment on a specific line
- `submit_review` - Submit a review (approve/request changes/comment)
- `get_pr_checks` - Get CI/CD check runs for a pull request
- `get_pr_status` - Get combined status for a pull request

### Repository Operations
- `git_commit` - Create a git commit with GitHub App as author (requires staged changes)

## Setup

### 1. Create a GitHub App

#### Step 1: Navigate to GitHub App Settings
1. Go to your GitHub account settings (click your profile picture → Settings)
2. In the left sidebar, scroll down to "Developer settings" and click it
3. Click "GitHub Apps" in the left sidebar
4. Click the "New GitHub App" button

#### Step 2: Configure Your GitHub App
Fill in the following information:

**Basic Information:**
- **GitHub App name**: Choose a unique name (e.g., "my-github-mcp-app")
- **Homepage URL**: Can be your GitHub profile URL or any valid URL
- **Webhook**: Uncheck "Active" (not needed for this MCP server)

**Permissions:**
Scroll to "Repository permissions" and set:
- **Contents**: Read & Write
- **Issues**: Read & Write  
- **Pull requests**: Read & Write
- **Checks**: Read
- **Commit statuses**: Read

Scroll to "Organization permissions" and set:
- **Members**: Read (only if you plan to use team reviewers)

**Where can this GitHub App be installed?**
- Choose "Only on this account" for personal use
- Choose "Any account" if you want others to use your app

Click "Create GitHub App"

#### Step 3: Generate Private Key
1. After creating the app, you'll be redirected to the app settings page
2. Scroll down to "Private keys" section
3. Click "Generate a private key"
4. A `.pem` file will be downloaded to your computer - save this securely!

#### Step 4: Get Your App ID
- On the same settings page, find your "App ID" at the top (it's a number like `123456`)
- Copy this number - you'll need it for configuration

#### Step 5: Install the App and Get Installation ID
1. On your app settings page, click "Install App" in the left sidebar
2. Click "Install" next to your account name
3. Select which repositories the app can access:
   - "All repositories" for full access
   - "Only select repositories" to choose specific repos
4. Click "Install"
5. After installation, look at the URL in your browser. It will look like:
   `https://github.com/settings/installations/12345678`
6. The number at the end (`12345678`) is your Installation ID - copy this!

#### Step 6: Prepare Your Private Key
The private key needs to be Base64 encoded for the configuration:

```bash
# On macOS/Linux:
base64 -i path/to/your-app.private-key.pem | tr -d '\n'

# On Windows (PowerShell):
[Convert]::ToBase64String([System.IO.File]::ReadAllBytes("path\to\your-app.private-key.pem"))
```

Copy the entire output - this is your encoded private key.

#### Summary of Required Values
You should now have:
- **App ID**: A number like `123456`
- **Installation ID**: A number like `12345678`  
- **Private Key (Base64)**: A long string starting with something like `LS0tLS1CRUdJTi...`

### 2. Install the MCP Server

Run this command in Claude Code:

```bash
claude mcp add github-as-app npx github-as-app \
  -e BOT_GITHUB_APP_ID=your-app-id \
  -e BOT_GITHUB_APP_PRIVATE_KEY=your-base64-encoded-private-key \
  -e BOT_GITHUB_APP_INSTALLATION_ID=your-installation-id
```

Replace the values with your actual App ID, Base64-encoded private key, and Installation ID from the previous steps.

**Note**: The server supports both `BOT_GITHUB_` and `GITHUB_` prefixes for environment variables. `BOT_GITHUB_` is recommended for GitHub Actions compatibility (as GitHub Actions doesn't allow secrets starting with `GITHUB_`). If both are set, `BOT_GITHUB_` takes precedence.

### 3. Update CLAUDE.md (Recommended)

Add the following to your project's CLAUDE.md file:

```markdown
# GitHub Operations

When github-as-app MCP is set up, use the github-as-app MCP tools instead of the gh command for GitHub operations.

Use the git_commit tool instead of git commit for making commits.
```

This ensures that Claude Code will use the MCP tools for GitHub operations rather than falling back to CLI commands.

## License

MIT