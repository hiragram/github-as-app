import { App } from '@octokit/app';
import { Octokit } from '@octokit/rest';
import fs from 'fs';

let appInstance: App | null = null;
let octokitInstance: any = null;

// Logging helper
const log = (message: string, data?: any) => {
  const timestamp = new Date().toISOString();
  const logMessage = `[${timestamp}] [github-client] ${message}${data ? ' ' + JSON.stringify(data) : ''}\n`;
  fs.appendFileSync('/tmp/github-as-app.log', logMessage);
};

export async function getGitHubClient(): Promise<Octokit> {
  if (octokitInstance) {
    log('Returning cached GitHub client');
    return octokitInstance;
  }

  log('Creating new GitHub client');

  // Support both BOT_GITHUB_ and GITHUB_ prefixes for backward compatibility
  // BOT_GITHUB_ takes precedence
  const appId = process.env.BOT_GITHUB_APP_ID || process.env.GITHUB_APP_ID;
  const privateKey = process.env.BOT_GITHUB_APP_PRIVATE_KEY || process.env.GITHUB_APP_PRIVATE_KEY;
  const installationId = process.env.BOT_GITHUB_APP_INSTALLATION_ID || process.env.GITHUB_APP_INSTALLATION_ID;

  const credentialStatus = {
    hasAppId: !!appId,
    hasPrivateKey: !!privateKey,
    hasInstallationId: !!installationId,
    appId: appId ? 'SET' : 'NOT SET',
    privateKeyLength: privateKey ? privateKey.length : 0,
    installationId: installationId ? 'SET' : 'NOT SET',
  };
  
  log('Credential status', credentialStatus);

  if (!appId || !privateKey || !installationId) {
    const errorMsg = `Missing required GitHub App credentials: ${JSON.stringify(credentialStatus)}`;
    log('Error: ' + errorMsg);
    throw new Error(errorMsg);
  }

  // Decode base64 private key if needed
  const decodedPrivateKey = privateKey.includes('BEGIN RSA PRIVATE KEY')
    ? privateKey
    : Buffer.from(privateKey, 'base64').toString('utf-8');

  log('Attempting to create GitHub App instance', {
    appId: parseInt(appId, 10),
    privateKeyPreview: decodedPrivateKey.substring(0, 50) + '...',
  });

  try {
    appInstance = new App({
      appId: parseInt(appId, 10),
      privateKey: decodedPrivateKey,
    });
    
    log('GitHub App instance created, getting installation client');

    // Use createInstallationAccessToken method directly
    const installationOctokit = await appInstance.getInstallationOctokit(parseInt(installationId, 10));
    
    log('Installation Octokit obtained', {
      keys: Object.keys(installationOctokit).slice(0, 20),
      hasRequest: !!installationOctokit.request,
    });
    
    // The returned instance should already be authenticated
    // Let's check if it's the new Octokit interface
    octokitInstance = installationOctokit as any;
    
    // Check what we actually have
    const hasRestAPI = !!(octokitInstance.rest || octokitInstance.issues);
    log('Checking for REST API methods', {
      hasRest: !!octokitInstance.rest,
      hasIssues: !!octokitInstance.issues,
      hasRestIssues: !!octokitInstance.rest?.issues,
    });
    
    if (!hasRestAPI) {
      // If no REST methods, we might need to use the request method directly
      log('No REST API methods found, will use request method');
    }
  } catch (error) {
    const errorDetails = {
      error: error instanceof Error ? error.message : String(error),
      errorStack: error instanceof Error ? error.stack : undefined,
      appId: appId ? 'SET' : 'NOT SET',
      privateKeyPreview: decodedPrivateKey ? decodedPrivateKey.substring(0, 50) + '...' : 'NOT SET',
      installationId: installationId ? 'SET' : 'NOT SET',
    };
    
    log('Failed to initialize GitHub App', errorDetails);
    console.error('Failed to initialize GitHub App:', errorDetails);
    throw new Error(`GitHub App initialization failed: ${error instanceof Error ? error.message : String(error)}`);
  }

  // If we don't have REST API methods, create wrappers using the request method
  if (!octokitInstance?.issues && octokitInstance?.request) {
    log('Creating REST API wrappers using request method');
    
    octokitInstance.issues = {
      create: (params: any) => octokitInstance.request('POST /repos/{owner}/{repo}/issues', params),
      listForRepo: (params: any) => octokitInstance.request('GET /repos/{owner}/{repo}/issues', params),
      get: (params: any) => octokitInstance.request('GET /repos/{owner}/{repo}/issues/{issue_number}', params),
      update: (params: any) => octokitInstance.request('PATCH /repos/{owner}/{repo}/issues/{issue_number}', params),
      createComment: (params: any) => octokitInstance.request('POST /repos/{owner}/{repo}/issues/{issue_number}/comments', params),
      updateComment: (params: any) => octokitInstance.request('PATCH /repos/{owner}/{repo}/issues/comments/{comment_id}', params),
      addAssignees: (params: any) => octokitInstance.request('POST /repos/{owner}/{repo}/issues/{issue_number}/assignees', params),
    };
    
    octokitInstance.pulls = {
      list: (params: any) => octokitInstance.request('GET /repos/{owner}/{repo}/pulls', params),
      get: (params: any) => octokitInstance.request('GET /repos/{owner}/{repo}/pulls/{pull_number}', params),
      create: (params: any) => octokitInstance.request('POST /repos/{owner}/{repo}/pulls', params),
      update: (params: any) => octokitInstance.request('PATCH /repos/{owner}/{repo}/pulls/{pull_number}', params),
      merge: (params: any) => octokitInstance.request('PUT /repos/{owner}/{repo}/pulls/{pull_number}/merge', params),
      requestReviewers: (params: any) => octokitInstance.request('POST /repos/{owner}/{repo}/pulls/{pull_number}/requested_reviewers', params),
      createReviewComment: (params: any) => octokitInstance.request('POST /repos/{owner}/{repo}/pulls/{pull_number}/comments', params),
      createReview: (params: any) => octokitInstance.request('POST /repos/{owner}/{repo}/pulls/{pull_number}/reviews', params),
    };
    
    octokitInstance.repos = {
      getCombinedStatusForRef: (params: any) => octokitInstance.request('GET /repos/{owner}/{repo}/commits/{ref}/status', params),
    };
    
    octokitInstance.checks = {
      listForRef: (params: any) => octokitInstance.request('GET /repos/{owner}/{repo}/commits/{ref}/check-runs', params),
    };
    
    octokitInstance.git = {
      getRef: (params: any) => octokitInstance.request('GET /repos/{owner}/{repo}/git/ref/{ref}', params),
      getCommit: (params: any) => octokitInstance.request('GET /repos/{owner}/{repo}/git/commits/{commit_sha}', params),
      createBlob: (params: any) => octokitInstance.request('POST /repos/{owner}/{repo}/git/blobs', params),
      createTree: (params: any) => octokitInstance.request('POST /repos/{owner}/{repo}/git/trees', params),
      createCommit: (params: any) => octokitInstance.request('POST /repos/{owner}/{repo}/git/commits', params),
      updateRef: (params: any) => octokitInstance.request('PATCH /repos/{owner}/{repo}/git/refs/{ref}', params),
    };
  }

  // Final validation
  if (!octokitInstance?.request) {
    throw new Error('GitHub client initialization failed - no request method found');
  }

  log('GitHub client created successfully');
  return octokitInstance;
}

export interface GitHubContext {
  owner: string;
  repo: string;
}

export function parseRepository(repository: string): GitHubContext {
  const parts = repository.split('/');
  if (parts.length !== 2) {
    throw new Error('Invalid repository format. Expected: owner/repo');
  }
  return {
    owner: parts[0],
    repo: parts[1],
  };
}