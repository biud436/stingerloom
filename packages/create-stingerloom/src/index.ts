#!/usr/bin/env node

import { execSync } from "child_process";
import * as path from "path";
import * as fs from "fs";
import yargs from "yargs";
import { hideBin } from "yargs/helpers";

const SAMPLE_REPO_URL = "https://github.com/biud436/stingerloom.git";
const SAMPLE_PATH = "sample/01-hello-world";

function createProject() {
  const argv = yargs(hideBin(process.argv))
    .option("name", {
      type: "string",
      description: "Project name",
      default: "stingerloom-sample",
    })
    .parseSync();

  const projectName = argv.name;
  const projectPath = path.join(process.cwd(), projectName);

  if (fs.existsSync(projectPath)) {
    console.error(
      `Directory ${projectName} already exists. Please choose a different project name.`,
    );
    process.exit(1);
  }

  try {
    execSync("git --version", { stdio: "ignore" });
  } catch (error) {
    console.error("Git is not installed. Please install Git and try again.");
    process.exit(1);
  }

  console.log("Cloning sample project...");
  execSync(
    `git clone -n --depth=1 --filter=tree:0 ${SAMPLE_REPO_URL} ${projectPath}`,
    { stdio: "inherit" },
  );

  console.log("Checking out the sample directory...");
  process.chdir(projectPath);
  execSync(`git sparse-checkout set --no-cone ${SAMPLE_PATH}`, {
    stdio: "inherit",
  });
  execSync("git checkout", { stdio: "inherit" });

  console.log("Moving sample files to project root...");
  const sampleDir = path.join(projectPath, SAMPLE_PATH);
  fs.readdirSync(sampleDir).forEach((file) => {
    const srcPath = path.join(sampleDir, file);
    const destPath = path.join(projectPath, file);
    fs.renameSync(srcPath, destPath);
  });

  console.log("Removing Git metadata and unnecessary directories...");
  execSync("npx rimraf .git", { stdio: "inherit" });
  execSync(`npx rimraf ${path.join(projectPath, "sample")}`, {
    stdio: "inherit",
  });

  console.log("Sample project created successfully at", projectPath);
}

createProject();
