import { spawn } from 'child_process';

const env = {
  ...process.env,
  GITHUB_APP_ID: 'test',
  GITHUB_APP_PRIVATE_KEY: 'test',
  GITHUB_APP_INSTALLATION_ID: 'test'
};

const mcp = spawn('npx', ['-y', 'github-as-app@latest'], {
  stdio: ['pipe', 'pipe', 'pipe'],
  env
});

mcp.stdout.on('data', (data) => {
  const str = data.toString();
  if (str.includes('jsonrpc')) {
    console.log('MCP Response:', str);
    process.exit(0);
  }
});

mcp.stderr.on('data', (data) => {
  console.error('MCP Error:', data.toString());
});

// Send MCP request
setTimeout(() => {
  mcp.stdin.write(JSON.stringify({
    jsonrpc: '2.0',
    method: 'tools/list',
    id: 1
  }) + '\n');
}, 1000);

setTimeout(() => {
  console.error('Timeout - no response received');
  process.exit(1);
}, 5000);