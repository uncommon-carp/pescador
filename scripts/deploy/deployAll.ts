import fs from "fs";
import path from "path";
import { spawn } from "child_process";

const servicesDir = path.resolve(__dirname, "../../packages");
const skipServices = ["utils", "interfaces"];
const specialBuildServices = ["graph"];

function runCommand(
  command: string,
  args: string[],
  options: { cwd: string },
): Promise<void> {
  return new Promise((resolve, reject) => {
    const process = spawn(command, args, { stdio: "inherit", ...options });

    process.on("close", (code) => {
      if (code !== 0) {
        reject(new Error(`Command failed: ${command} ${args.join(" ")}`));
      } else {
        resolve();
      }
    });

    process.on("error", (err) => {
      reject(new Error(`Failed to start process: ${err.message}`));
    });
  });
}

async function deployService(service: string): Promise<void> {
  const servicePath = path.join(servicesDir, service);

  if (skipServices.includes(service)) {
    console.log(`Skipping non-deployable service: ${service}`);
    return;
  }

  const hasServerlessConfig =
    fs.existsSync(path.join(servicePath, "serverless.yml")) ||
    fs.existsSync(path.join(servicePath, "serverless.ts"));

  if (!hasServerlessConfig) {
    console.log(
      `Skipping ${service} as it doesn't have a serverless configuration.`,
    );
    return;
  }

  console.log(`Deploying service: ${service}`);

  if (specialBuildServices.includes(service)) {
    console.log(`Building ${service} before deployment...`);
    await runCommand("npm", ["run", "build"], { cwd: servicePath });
  }

  await runCommand("sls", ["deploy"], { cwd: servicePath });
}

async function deployAllServices(): Promise<void> {
  const services = fs.readdirSync(servicesDir);

  const deploymentPromises = services.map((service) =>
    deployService(service).catch((err) => {
      console.error(`Error deploying service ${service}: ${err.message}`);
    }),
  );

  await Promise.all(deploymentPromises);

  console.log("All services deployment finished!");
}

deployAllServices().catch((err) => {
  console.error(`Unexpected error: ${err.message}`);
  process.exit(1);
});
