import { spawn } from "child_process";
import * as fs from "fs";
import * as path from "path";

const baseDir = path.join(__dirname, "../");
const servicesDir = path.join(baseDir, "packages", "services");
const graphDir = path.join(baseDir, "packages", "graph");

const getServices = (): string[] => {
  return fs.readdirSync(servicesDir).filter((dir) => {
    const dirPath = path.join(servicesDir, dir);
    return fs.statSync(dirPath).isDirectory();
  });
};

const runNpmScript = (script: string, servicePath: string): Promise<void> => {
  console.log(`\nRunning npm script '${script}' in ${servicePath}...`);

  return new Promise((resolve, reject) => {
    const npmProcess = spawn("npm", ["run", script], {
      cwd: servicePath,
      stdio: "inherit",
      shell: true,
    });

    npmProcess.on("close", (code) => {
      if (code === 0) {
        console.log(
          `Npm script '${script}' completed successfully in ${servicePath}.`,
        );
        resolve();
      } else {
        console.error(
          `Error running npm script '${script}', exit code: ${code}`,
        );
        reject(
          new Error(`Failed to run npm script '${script}' in ${servicePath}`),
        );
      }
    });
  });
};

const deployService = (
  servicePath: string,
  serviceName: string,
): Promise<void> => {
  console.log(`\nDeploying: ${serviceName}...`);

  return new Promise((resolve, reject) => {
    const deployProcess = spawn("serverless", ["deploy"], {
      cwd: servicePath,
      stdio: "inherit",
      shell: true,
    });

    deployProcess.on("close", (code) => {
      if (code === 0) {
        console.log(`${serviceName} deployed successfully.`);
        resolve();
      } else {
        console.error(`Error deploying ${serviceName}, exit code: ${code}`);
        reject(new Error(`Failed to deploy ${serviceName}`));
      }
    });
  });
};

const deployAll = async (): Promise<void> => {
  // Deploy the graph service first
  try {
    await runNpmScript("build", graphDir); // Run the build step for the graph service
    await deployService(graphDir, "graph");
  } catch (error) {
    console.error(
      `Deployment failed for graph. ${error} Continuing to other services...`,
    );
  }

  const services = getServices();

  for (const service of services) {
    const servicePath = path.join(servicesDir, service);
    try {
      await deployService(servicePath, service);
    } catch (error) {
      console.error(
        `Deployment failed for ${service}. ${error} Continuing to next service...`,
      );
    }
  }

  console.log("\nAll services and graph deployed.");
};

deployAll();
