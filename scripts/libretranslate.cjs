const { spawnSync } = require('node:child_process');
const path = require('node:path');
const http = require('node:http');

const repoRoot = path.resolve(__dirname, '..');
const composeArgs = ['compose', '-f', 'docker-compose.libretranslate.yml'];
const defaultLibreUrl = process.env.LIBRETRANSLATE_URL || 'http://127.0.0.1:5000';
const readyUrl = new URL('/languages', defaultLibreUrl).toString();
const readyTimeoutMs = 180000;
const readyPollMs = 2000;

function hasCommand(command, args = ['--version']) {
  const result = spawnSync(command, args, {
    cwd: repoRoot,
    shell: true,
    encoding: 'utf8',
  });

  return result.status === 0;
}

function getDockerAvailability() {
  if (!hasCommand('docker')) {
    return { available: false, reason: 'missing-cli' };
  }

  const result = spawnSync('docker', ['info'], {
    cwd: repoRoot,
    shell: true,
    encoding: 'utf8',
  });

  if (result.status === 0) {
    return { available: true };
  }

  return {
    available: false,
    reason: 'daemon-unreachable',
    details: `${result.stderr || ''}${result.stdout || ''}`.trim(),
  };
}

function run(command, args) {
  const result = spawnSync(command, args, {
    cwd: repoRoot,
    shell: true,
    stdio: 'inherit',
  });

  process.exit(result.status || 0);
}

function runAndCapture(command, args) {
  return spawnSync(command, args, {
    cwd: repoRoot,
    shell: true,
    encoding: 'utf8',
  });
}

function wait(ms) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

function probeUrl(url) {
  return new Promise((resolve) => {
    const request = http.get(url, (response) => {
      const ok = response.statusCode >= 200 && response.statusCode < 300;
      response.resume();
      resolve(ok);
    });

    request.on('error', () => resolve(false));
    request.setTimeout(3000, () => {
      request.destroy();
      resolve(false);
    });
  });
}

function printStartupLogs() {
  const result = runAndCapture('docker', ['logs', '--tail', '40', 'fip-bituin-libretranslate']);

  if ((result.stdout || '').trim()) {
    console.error('');
    console.error('Recent LibreTranslate logs:');
    console.error(result.stdout.trim());
  }

  if ((result.stderr || '').trim()) {
    console.error(result.stderr.trim());
  }
}

async function waitForLibreTranslate() {
  const start = Date.now();

  while (Date.now() - start < readyTimeoutMs) {
    if (await probeUrl(readyUrl)) {
      console.log(`LibreTranslate is ready at ${defaultLibreUrl}`);
      return true;
    }

    console.log('Waiting for LibreTranslate to finish starting...');
    await wait(readyPollMs);
  }

  console.error(`LibreTranslate did not become ready within ${Math.round(readyTimeoutMs / 1000)} seconds.`);
  console.error('The first startup can take a while while language models are downloaded.');
  printStartupLogs();
  return false;
}

function printMissingRuntimeHelp() {
  console.error('LibreTranslate self-hosting needs a local runtime.');
  console.error('');
  console.error('No supported runtime was found on this machine:');
  console.error('- Docker: not installed');
  console.error('- Python: not installed');
  console.error('');
  console.error('Use one of these options:');
  console.error('1. Install Docker Desktop, restart your terminal, then run: npm run translate');
  console.error('2. Install Python 3.8+, then run LibreTranslate yourself and set LIBRETRANSLATE_URL in server/.env');
  console.error('');
  console.error('Windows note: Docker Desktop is the simplest supported path for this repo.');
}

function printDockerDaemonHelp(details) {
  console.error('Docker is installed, but the Docker engine is not running or not reachable.');
  console.error('');
  console.error('Fix on Windows:');
  console.error('1. Start Docker Desktop');
  console.error('2. Wait until Docker Desktop shows that the engine is running');
  console.error('3. Reopen your terminal');
  console.error('4. Run: npm run translate');

  if (details) {
    console.error('');
    console.error('Docker reported:');
    console.error(details);
  }
}

async function main() {
  const action = process.argv[2] || 'start';
  const docker = getDockerAvailability();

  if (docker.available) {
    if (action === 'stop') {
      run('docker', [...composeArgs, 'down']);
      return;
    }

    const upResult = runAndCapture('docker', [...composeArgs, 'up', '-d']);

    if ((upResult.stdout || '').trim()) {
      console.log(upResult.stdout.trim());
    }

    if ((upResult.stderr || '').trim()) {
      console.error(upResult.stderr.trim());
    }

    if (upResult.status !== 0) {
      process.exit(upResult.status || 1);
    }

    const ready = await waitForLibreTranslate();
    process.exit(ready ? 0 : 1);
    return;
  }

  if (docker.reason === 'daemon-unreachable') {
    printDockerDaemonHelp(docker.details);
    process.exit(1);
  }

  if (hasCommand('python') || hasCommand('py')) {
    console.error('Docker is not installed.');
    console.error('');
    console.error('You do have a Python runtime available, but this repo does not provision LibreTranslate automatically with Python.');
    console.error('Either install Docker Desktop and use npm run translate, or run your own LibreTranslate instance and point server/.env at it:');
    console.error('LIBRETRANSLATE_URL=http://127.0.0.1:5000');
    process.exit(1);
  }

  printMissingRuntimeHelp();
  process.exit(1);
}

main().catch((error) => {
  console.error(error?.message || error);
  process.exit(1);
});