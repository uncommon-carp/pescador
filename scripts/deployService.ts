import { spawn } from "child_process";
import * as fs from "fs";
import * as path from "path";

const baseDir = path.join(__dirname, "../");
const servicesDir = path.join(baseDir, "packages", "services");
const graphDir = path.join(baseDir, "packages", "graph");

const serviceName = process.argv[2];

const runNpmScript = (script: string, servicePath: string): Promise<void> => {
  console.log(`\nRunning npm script '${script}' for ${servicePath}...`);

  return new Promise((resolve, reject) => {
    const npmProcess = spawn("npm", ["run", script], {
      cwd: servicePath,
      stdio: "inherit",
      shell: true,
    });

    npmProcess.on("close", (code) => {
      if (code === 0) {
        console.log(`Npm script '${script}' completed successfully.`);
        resolve();
      } else {
        console.error(
          `Error running npm script '${script}', exit code: ${code}`,
        );
        reject(new Error(`Failed to run npm script '${script}'`));
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

const findServiceDirectory = (serviceName: string): string | null => {
  const services = fs.readdirSync(servicesDir);

  for (const service of services) {
    const servicePath = path.join(servicesDir, service);
    if (
      fs.statSync(servicePath).isDirectory() &&
      service.toLowerCase() === serviceName.toLowerCase()
    ) {
      return servicePath;
    }
  }

  return null;
};

const deploySingle = async (): Promise<void> => {
  if (!serviceName) {
    console.error("Please provide a service name.");
    return;
  }

  if (serviceName === "graph") {
    try {
      await runNpmScript("build", graphDir); // Adjust 'build' to the appropriate npm script
      await deployService(graphDir, "graph");
    } catch (error) {
      console.error("Error during graph build or deployment:", error);
    }
  } else {
    const servicePath = findServiceDirectory(serviceName);

    if (servicePath) {
      await deployService(servicePath, serviceName);
    } else {
      console.error(`Service ${serviceName} not found in ${servicesDir}.`);
    }
  }
};

deploySingle();
