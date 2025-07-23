import fs from 'fs';
import path from 'path';
import { spawn } from 'child_process';

const servicesDir = path.resolve(__dirname, '../../services');
const skipServices = ['utils', 'ui', 'interfaces'];
const specialBuildServices = ['graph'];

function runCommand(
  command: string,
  args: string[],
  options: { cwd: string },
): Promise<void> {
  return new Promise((resolve, reject) => {
    const process = spawn(command, args, { stdio: 'inherit', ...options });

    process.on('close', (code) => {
      if (code !== 0) {
        reject(new Error(`Command failed: ${command} ${args.join(' ')}`));
      } else {
        resolve();
      }
    });
  });
}

async function deployService(service: string): Promise<void> {
  const servicePath = path.join(servicesDir, service);

  if (!fs.existsSync(servicePath)) {
    console.error(
      `Error: Service "${service}" does not exist in the packages directory.`,
    );
    process.exit(1);
  }

  if (skipServices.includes(service)) {
    console.log(`Warning: Service "${service}" is marked as non-deployable.`);
    process.exit(0);
  }

  const hasServerlessConfig =
    fs.existsSync(path.join(servicePath, 'serverless.yml')) ||
    fs.existsSync(path.join(servicePath, 'serverless.ts'));

  if (!hasServerlessConfig) {
    console.error(
      `Warning: Service "${service}" does not have a serverless configuration file.`,
    );
    process.exit(1);
  }

  console.log(`Deploying service: ${service}`);

  if (specialBuildServices.includes(service)) {
    console.log(`Building ${service} before deployment...`);
    await runCommand('npm', ['run', 'build'], { cwd: servicePath });
  }

  await runCommand('sls', ['deploy'], { cwd: servicePath });
}

const serviceName = process.argv[2];

if (!serviceName) {
  console.error('Error: Please provide a service name to deploy.');
  console.error('Usage: npm run deploy:service <service-name>');
  process.exit(1);
}

deployService(serviceName).catch((err) => {
  console.error(err.message);
  process.exit(1);
});
