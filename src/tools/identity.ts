import { getGitHubClient } from '../github-client.js';
import fs from 'fs';

const log = (message: string, data?: any) => {
  const timestamp = new Date().toISOString();
  const logMessage = `[${timestamp}] [identity] ${message}${data ? ' ' + JSON.stringify(data) : ''}\n`;
  fs.appendFileSync('/tmp/github-as-app.log', logMessage);
};

export async function handleGetIdentity() {
  log('Getting GitHub App identity');
  
  try {
    const client = await getGitHubClient();
    
    const response = await client.request('GET /app');
    const appData = response.data as any;
    
    const installations = await client.request('GET /app/installations');
    const currentInstallationId = parseInt(process.env.GITHUB_APP_INSTALLATION_ID || '0', 10);
    const currentInstallation = (installations.data as any[]).find((inst: any) => inst.id === currentInstallationId);
    
    const identity = {
      app: {
        id: appData.id,
        slug: appData.slug,
        name: appData.name,
        owner: appData.owner,
        description: appData.description,
        external_url: appData.external_url,
        html_url: appData.html_url,
        created_at: appData.created_at,
        updated_at: appData.updated_at,
      },
      installation: currentInstallation ? {
        id: currentInstallation.id,
        account: currentInstallation.account,
        repository_selection: currentInstallation.repository_selection,
        permissions: currentInstallation.permissions,
        events: currentInstallation.events,
        created_at: currentInstallation.created_at,
        updated_at: currentInstallation.updated_at,
      } : null,
    };
    
    log('Successfully retrieved identity', identity);
    return identity;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    log('Failed to get identity', { error: errorMessage });
    throw new Error(`Failed to get GitHub App identity: ${errorMessage}`);
  }
}