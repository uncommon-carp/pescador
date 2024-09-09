import { spawn } from "child_process";
import * as fs from "fs";
import * as path from "path";

// Define paths to services and graph directory
const baseDir = path.join(__dirname, "../");
const servicesDir = path.join(baseDir, "packages", "services");
const graphDir = path.join(baseDir, "packages", "graph");

// Get the service name from the command line arguments
const serviceName = process.argv[2];

// Function to run the npm command (like `npm run build`)
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

// Function to deploy a specific service using `spawn`
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

// Helper function to find the service directory (case-insensitive match)
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

// Main function to deploy either `graph` or a specific service in `services`
const deploySingle = async (): Promise<void> => {
  if (!serviceName) {
    console.error("Please provide a service name.");
    return;
  }

  if (serviceName === "graph") {
    // Run the build step for the graph service before deploying
    try {
      await runNpmScript("build", graphDir); // Adjust 'build' to the appropriate npm script
      await deployService(graphDir, "graph");
    } catch (error) {
      console.error("Error during graph build or deployment:", error);
    }
  } else {
    // Deploy a specific service in the services directory
    const servicePath = findServiceDirectory(serviceName);

    if (servicePath) {
      await deployService(servicePath, serviceName);
    } else {
      console.error(`Service ${serviceName} not found in ${servicesDir}.`);
    }
  }
};

// Run the single deployment
deploySingle();
