import { App } from '@octokit/app';
import { Octokit } from '@octokit/rest';

let appInstance: App | null = null;
let octokitInstance: any = null;

export async function getGitHubClient(): Promise<Octokit> {
  if (octokitInstance) {
    return octokitInstance;
  }

  const appId = process.env.GITHUB_APP_ID;
  const privateKey = process.env.GITHUB_APP_PRIVATE_KEY;
  const installationId = process.env.GITHUB_APP_INSTALLATION_ID;

  if (!appId || !privateKey || !installationId) {
    throw new Error('Missing required GitHub App credentials');
  }

  // Decode base64 private key if needed
  const decodedPrivateKey = privateKey.includes('BEGIN RSA PRIVATE KEY')
    ? privateKey
    : Buffer.from(privateKey, 'base64').toString('utf-8');

  appInstance = new App({
    appId: parseInt(appId, 10),
    privateKey: decodedPrivateKey,
  });

  octokitInstance = await appInstance.getInstallationOctokit(parseInt(installationId, 10));

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